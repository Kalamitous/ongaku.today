import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useReorderFolders } from '@/hooks/mutations/use-reorder-folders';
import { SortableFolder } from './draggable-folder';
import { FolderDragOverlay } from './folder-drag-overlay';
import { Folder } from '@/lib/api/folders';

interface VirtualizedSortableListProps {
  folders: Folder[]; // Changed from parentId to folders array
  parentId: string | null; // Kept for mutations
  onSelectFolder: (folderId: string, folderName: string) => void;
  selectedParentId: string | null;
  containerHeight?: number;
}

export function VirtualizedSortableList({ 
  folders, // Receive data directly instead of fetching
  parentId, 
  onSelectFolder, 
  selectedParentId,
  containerHeight = 600 
}: VirtualizedSortableListProps) {
  const reorderFolders = useReorderFolders();
  const [isDragging, setIsDragging] = useState(false);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [localFolders, setLocalFolders] = useState<Folder[]>(folders);
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Sync local state with prop data for instant updates
  useEffect(() => {
    setLocalFolders(folders || []);
  }, [folders]);
  
  const overlayContent = () => {
    if (!activeFolder) return null;
    return <FolderDragOverlay folder={activeFolder} />;
  };

  const virtualizer = useVirtualizer({
    count: localFolders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // Fixed height based on FolderItem
    overscan: 5, // Render 5 extra items off-screen
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    setIsDragging(true);
    const { active } = event;
    const folder = localFolders.find(f => f.id === active.id);
    setActiveFolder(folder || null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    const draggedItemIndex = localFolders.findIndex(folder => folder.id === active.id);
    const targetIndex = over ? localFolders.findIndex(folder => folder.id === over.id) : -1;
    
    // Update local state immediately (instant like Zustand)
    if (active.id !== over?.id && draggedItemIndex !== -1 && targetIndex !== -1) {
      const newFolders = [...localFolders];
      const [movedFolder] = newFolders.splice(draggedItemIndex, 1);
      newFolders.splice(targetIndex, 0, movedFolder);
      setLocalFolders(newFolders);
      
      // Then trigger mutation for server sync
      reorderFolders.mutate({ parentId, oldIndex: draggedItemIndex, newIndex: targetIndex });
    }
    
    // Clear drag states
    setActiveFolder(null);
    setIsDragging(false);
  }

  return (
    <div className={`sortable-folder-list ${isDragging ? 'dragging' : ''}`}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={localFolders.map(folder => folder.id)}
          strategy={verticalListSortingStrategy}
        >
          <div 
            ref={parentRef}
            style={{ 
              height: `${containerHeight}px`, 
              overflow: 'auto' 
            }}
          >
            <div 
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const folder = localFolders[virtualItem.index];
                return (
                  <div
                    key={folder.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <SortableFolder
                      folder={folder}
                      isSelected={selectedParentId === folder.id}
                      onClick={() => onSelectFolder(folder.id, folder.name)}
                      onContextMenu={(e, itemId) => {
                        // No context menu for now - just prevent default
                        e.preventDefault();
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </SortableContext>
        
        {createPortal(
          <DragOverlay>
            {overlayContent()}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
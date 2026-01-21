import { useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useFolderStore } from '@/stores/folder-store';
import { useFolderData } from '@/hooks/use-folder-data';
import { SortableFolder } from './draggable-folder';
import { FolderDragOverlay } from './folder-drag-overlay';
import { Folder } from '@/lib/api/folders';

interface VirtualizedSortableListProps {
  parentId: string | null;
  onSelectFolder: (folderId: string, folderName: string) => void;
  selectedParentId: string | null;
  containerHeight?: number;
}

export function VirtualizedSortableList({ 
  parentId, 
  onSelectFolder, 
  selectedParentId,
  containerHeight = 600 
}: VirtualizedSortableListProps) {
  const { reorderFolders } = useFolderStore();
  const { folders } = useFolderData(parentId);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const overlayContent = useMemo(() => {
    if (!activeFolder) return null;
    
    return (
      <FolderDragOverlay folder={activeFolder} />
    );
  }, [activeFolder]);

  const virtualizer = useVirtualizer({
    count: folders.length,
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
    setActiveId(active.id as string);
    const folder = folders.find(f => f.id === active.id);
    setActiveFolder(folder || null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = folders.findIndex(folder => folder.id === active.id);
      const newIndex = folders.findIndex(folder => folder.id === over.id);
      reorderFolders(parentId, oldIndex, newIndex);
    }
    
    // Clear drag states
    setActiveId(null);
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
          items={folders.map(folder => folder.id)}
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
                const folder = folders[virtualItem.index];
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
            {overlayContent}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
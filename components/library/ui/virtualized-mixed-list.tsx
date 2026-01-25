"use client";

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent, CollisionDescriptor } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';


import { useReorderFolders } from '@/hooks/mutations/use-reorder-folders';
import { useReorderTracks } from '@/hooks/mutations/use-reorder-tracks';
import { useMoveTrackToFolder } from '@/hooks/mutations/use-move-track-to-folder';
import { SortableFolder } from './draggable-folder';
import { DraggableTrack } from './draggable-track';
import { FolderItem } from './folder-item';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GenericDragOverlay } from './generic-drag-overlay';
import { Folder as FolderIcon } from "lucide-react";
import { Music } from "lucide-react";
import { Folder } from '@/lib/api/folders';
import { Track } from '@/types/library.types';

interface MixedItem {
  id: string;
  type: 'folder' | 'track';
  data: Folder | Track;
}

// Mixed folder component that handles prefixed IDs
function SortableFolderMixed({ folder, isSelected, onClick, onContextMenu }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `folder-${folder.id}` }); // Use prefixed ID

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-dnd-dragging={isDragging}
    >
      <FolderItem
        folder={folder}
        isSelected={isSelected}
        onClick={onClick}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}

interface VirtualizedMixedListProps {
  folders: Folder[];
  tracks: Track[];
  parentId: string | null;
  onSelectFolder: (folderId: string, folderName: string) => void;
  onSelectTrack?: (trackId: string) => void;
  selectedParentId: string | null;
  containerHeight?: number;
}

export function VirtualizedMixedList({ 
  folders, 
  tracks, 
  parentId, 
  onSelectFolder,
  onSelectTrack,
  selectedParentId,
  containerHeight = 600 
}: VirtualizedMixedListProps) {
  const reorderFolders = useReorderFolders();
  const reorderTracks = useReorderTracks();
  const moveTrackToFolder = useMoveTrackToFolder();
  
  const [isDragging, setIsDragging] = useState(false);
  const [activeItem, setActiveItem] = useState<MixedItem | null>(null);
  const [localItems, setLocalItems] = useState<MixedItem[]>([]);
  const [canDrop, setCanDrop] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Create mixed items list: folders first, then tracks
  useEffect(() => {
    const folderItems: MixedItem[] = folders.map(folder => ({
      id: `folder-${folder.id}`,
      type: 'folder' as const,
      data: folder
    }));
    
    const trackItems: MixedItem[] = tracks.map(track => ({
      id: `track-${track.id}`,
      type: 'track' as const,
      data: track
    }));
    
    setLocalItems([...folderItems, ...trackItems]);
  }, [folders, tracks]);
  
  const overlayContent = () => {
    if (!activeItem) return null;
    
    if (activeItem.type === 'folder') {
      return (
        <GenericDragOverlay
          item={activeItem.data as Folder}
          icon={FolderIcon}
          iconClassName="text-blue-500"
          getTitle={(folder) => folder.name}
          showChevron={true}
        />
      );
    } else {
      return (
        <GenericDragOverlay
          item={activeItem.data as Track}
          icon={Music}
          getTitle={(track) => track.title}
          subtitle={(activeItem.data as Track).artist || undefined}
        />
      );
    }
  };

  const virtualizer = useVirtualizer({
    count: localItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setIsDragging(true);
    setCanDrop(true); // Reset on drag start
    const { active } = event;
    const item = localItems.find(i => i.id === active.id);
    setActiveItem(item || null);
  }

  function handleDragMove(event: any) {
    const { active, over } = event;
    if (!over) {
      setCanDrop(true);
      return;
    }

    const activeItem = localItems.find(i => i.id === active.id);
    const overItem = localItems.find(i => i.id === over.id);

    if (activeItem && overItem && activeItem.type !== overItem.type) {
      setCanDrop(false); // Don't allow cross-type drops
    } else {
      setCanDrop(true);
    }
  }

  // Custom collision detection that prevents cross-type dragging
  const restrictedCollisionDetection = (args: any): any[] => {
    const { active } = args;
    const activeItem = localItems.find(i => i.id === active.id);
    
    if (!activeItem) return [];
    
    // Get base collisions
    const baseCollisions = closestCenter(args);
    
    // Filter out cross-type collisions
    return baseCollisions.filter((collision: any) => {
      const overItem = localItems.find(i => i.id === collision.id);
      return overItem && overItem.type === activeItem.type;
    });
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !canDrop) {
      setActiveItem(null);
      setIsDragging(false);
      setCanDrop(true);
      return;
    }
    
    const draggedItemIndex = localItems.findIndex(item => item.id === active.id);
    const targetIndex = localItems.findIndex(item => item.id === over.id);
    
    if (draggedItemIndex === -1 || targetIndex === -1) {
      setActiveItem(null);
      setIsDragging(false);
      return;
    }
    
    const draggedItem = localItems[draggedItemIndex];
    const targetItem = localItems[targetIndex];
    
    // Handle different drag scenarios
    if (draggedItem.id === targetItem.id) {
      // No movement
    } else if (draggedItem.type === targetItem.type) {
      // Same type: reorder within type
      if (draggedItem.type === 'folder') {
        const folderOldIndex = folders.findIndex(f => f.id === (draggedItem.data as Folder).id);
        const folderNewIndex = folders.findIndex(f => f.id === (targetItem.data as Folder).id);
        reorderFolders.mutate({ parentId, oldIndex: folderOldIndex, newIndex: folderNewIndex });
      } else {
        const trackOldIndex = tracks.findIndex(t => t.id === (draggedItem.data as Track).id);
        const trackNewIndex = tracks.findIndex(t => t.id === (targetItem.data as Track).id);
        reorderTracks.mutate({ parentId, oldIndex: trackOldIndex, newIndex: trackNewIndex });
      }
    } else {
      // Cross-type dragging not allowed - maintain separation between folders and tracks
      // Only allow same-type reordering to keep folders first, tracks second
      return;
    }
    
    // Update local state immediately for instant feedback
    const newItems = [...localItems];
    const [movedItem] = newItems.splice(draggedItemIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    setLocalItems(newItems);
    
    setActiveItem(null);
    setIsDragging(false);
    setCanDrop(true);
  }

  return (
    <div 
      className={`mixed-sortable-list ${isDragging ? 'dragging' : ''}`}
      style={{ cursor: isDragging && !canDrop ? 'not-allowed' : 'auto' }}
    >
      <DndContext 
        sensors={sensors}
        collisionDetection={restrictedCollisionDetection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={localItems.map(item => item.id)}
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
                const item = localItems[virtualItem.index];
                if (!item) return null;
                
                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {item.type === 'folder' ? (
                      <SortableFolderMixed
                        key={item.id}
                        folder={item.data as Folder}
                        isSelected={selectedParentId === (item.data as Folder).id}
                        onClick={() => onSelectFolder((item.data as Folder).id, (item.data as Folder).name)}
                        onContextMenu={() => {}}
                      />
                    ) : (
                      <DraggableTrack
                        key={item.id}
                        track={item.data as Track}
                        onClick={() => onSelectTrack?.((item.data as Track).id)}
                        onContextMenu={() => {}}
                      />
                    )}
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
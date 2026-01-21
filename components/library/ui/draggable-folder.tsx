"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, Folder as FolderIcon } from 'lucide-react';
import { Folder } from '@/lib/api/folders';
import { FolderItem } from './folder-item';

interface SortableFolderProps {
  folder: Folder;
  isSelected?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

export function SortableFolder({ folder, isSelected = false, onClick, onContextMenu }: SortableFolderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

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
"use client";

import { Folder } from '@/lib/api/folders';
import { FolderItem } from './folder-item';
import { SortableItem } from './sortable-item';

interface SortableFolderProps {
  folder: Folder;
  isSelected?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

export function SortableFolder({ folder, isSelected = false, onClick, onContextMenu }: SortableFolderProps) {
  return (
    <SortableItem id={folder.id} isDragging={false}>
      <FolderItem
        folder={folder}
        isSelected={isSelected}
        onClick={onClick}
        onContextMenu={onContextMenu}
      />
    </SortableItem>
  );
}
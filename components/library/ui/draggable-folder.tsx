"use client";

import { Folder } from '@/lib/api/folders';
import { FolderItem } from './folder-item';
import { DraggableItem } from './draggable-item';

interface SortableFolderProps {
  folder: Folder;
  isSelected?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

export function SortableFolder({ folder, isSelected = false, onClick, onContextMenu }: SortableFolderProps) {
  return (
    <DraggableItem 
      item={folder} 
      render={(folderItem, props) => (
        <FolderItem
          folder={folderItem}
          isSelected={props.isSelected}
          onClick={props.onClick}
          onContextMenu={props.onContextMenu}
        />
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      isSelected={isSelected}
      idPrefix="folder-"
    />
  );
}
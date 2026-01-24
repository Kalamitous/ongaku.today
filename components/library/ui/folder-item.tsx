"use client";

import { Folder as FolderIcon } from "lucide-react";
import { ListItem } from './list-item';
import type { FolderItemProps } from "@/types/library.types";

export function FolderItem({ folder, onClick, onContextMenu, isSelected }: FolderItemProps) {
  return (
    <ListItem
      icon={FolderIcon}
      iconClassName="text-blue-500"
      title={folder.name}
      showChevron={true}
      onClick={() => onClick()}
      onContextMenu={(e) => onContextMenu(e, folder.id)}
      isSelected={isSelected}
    />
  );
}
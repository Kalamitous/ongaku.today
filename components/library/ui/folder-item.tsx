"use client";

import React from "react";
import { ChevronRight, Folder as FolderIcon } from "lucide-react";
import type { FolderItemProps } from "@/types/library.types";

export function FolderItem({ folder, onClick, onContextMenu }: FolderItemProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-accent transition-colors"
      onClick={() => onClick()}
      onContextMenu={(e) => onContextMenu(e, folder.id)}
    >
      <FolderIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{folder.name}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}
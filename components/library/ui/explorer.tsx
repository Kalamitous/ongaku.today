"use client";

import React from "react";
import { Folder as FolderIcon, ChevronRight } from "lucide-react";
import { FolderSkeletonList } from "./folder-skeleton";
import type { ExplorerProps } from "@/types/library.types";

export function Explorer({
  allFolders,
  selectedParentId,
  onSelectFolder,
  onNavigate,
  loading = false
}: ExplorerProps) {
  const currentLevelFolders = allFolders;

  if (loading) {
    return <FolderSkeletonList />;
  }

  if (currentLevelFolders.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 text-sm">
        <FolderIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {currentLevelFolders.map((folder) => (
        <div 
          key={folder.id}
          className={`p-2 rounded cursor-pointer text-sm flex items-center gap-2 ${
            selectedParentId === folder.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          }`}
          onClick={() => {
            onSelectFolder(folder.id);
            onNavigate(folder.id, folder.name);
          }}
        >
          <FolderIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate flex-1">{folder.name}</span>
          <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-60" />
        </div>
      ))}
    </div>
  );
}
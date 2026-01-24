"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewFolderDialog } from "../dialogs/new-folder-dialog";
import { AddTrackDialog } from "../dialogs/add-track-dialog";
import type { ActionsBarProps } from "@/types/library.types";

export function ActionsBar({ onCreateFolder, onAddTrack, onDeleteFolder, currentFolderId }: ActionsBarProps) {
  return (
    <div className="flex items-center gap-2">
      <NewFolderDialog 
        onConfirm={(folderName) => onCreateFolder(folderName)}
        triggerButton={
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
        }
      />
      <AddTrackDialog 
        folderId={currentFolderId || ""}
        onConfirm={(data) => {
          if (onAddTrack) {
            onAddTrack(data);
          }
        }}
        triggerButton={
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Track
          </Button>
        }
      />
    </div>
  );
}
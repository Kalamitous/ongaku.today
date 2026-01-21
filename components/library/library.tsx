"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder as FolderIcon } from "lucide-react";

// Custom hooks
import { useFolderData } from "@/hooks/use-folder-data";
import { useFolderActions } from "@/hooks/use-folder-actions";
import { useLibraryNavigation } from "@/hooks/use-library-navigation";
import { useTrackActions } from "@/hooks/use-track-actions";
import type { CreateTrackData } from "@/types/library.types";

// Utils
import { folderUtils } from "@/utils/folder-utils";
import { createPathUpdateCallback } from "@/utils/path-utils";

// Constants
import { ROOT_FOLDER, MESSAGES } from "@/constants/library";

// Store
import { useFolderStore } from "@/stores/folder-store";

// Types

// Components
import { NavigationBar } from "./ui/navigation-bar";
import { ActionsBar } from "./ui/actions-bar";
import { FolderSkeletonList } from "./ui/folder-skeleton";
import { VirtualizedSortableList } from "./ui/virtualized-sortable-list";

/**
 * Main library component that displays folder navigation and content
 * @returns JSX element representing the library interface
 */
export function Library() {
  // Navigation hook
  const {
    currentPath,
    setCurrentPath,
    getCurrentParentId,
    navigateTo: navigateToFolder,
    navigateToBreadcrumb
  } = useLibraryNavigation([ROOT_FOLDER]);

  // Data hook
  const currentParentId = getCurrentParentId();
  const { folders: currentFolders, loading } = useFolderData(currentParentId);

  // Actions hook
  const { createFolder, updateFolderDetails, deleteFolder } = useFolderActions();
  const { createTrack } = useTrackActions();

  const handleFolderClick = (folder: { id: string; name: string }) => {
    navigateToFolder(folder.id, folder.name);
  };

  const handleCreateFolder = (folderName: string) => {
    if (folderName.trim()) {
      createFolder(folderName.trim(), currentParentId);
    }
  };

  const handleAddTrack = (data: CreateTrackData) => {
    createTrack(data);
  };

  const handleUpdateFolder = async (folderId: string, folderName: string, selectedParentId: string | null) => {
    // Check if we're updating the current folder
    const currentFolder = currentPath[currentPath.length - 1];
    const isCurrentFolder = currentFolder.id === folderId;
    
    // Create path update callback only if needed
    const onPathUpdate = isCurrentFolder 
      ? createPathUpdateCallback(folderId, setCurrentPath)
      : () => {};

    updateFolderDetails(folderId, folderName, selectedParentId, onPathUpdate);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folderId && folderId !== "root") {
      deleteFolder(
        folderId,
        () => {
          // Navigate to parent folder after delete if we're deleting the current folder
          const currentFolder = currentPath[currentPath.length - 1];
          if (currentFolder.id === folderId && currentPath.length > 1) {
            navigateToBreadcrumb(currentPath.length - 2);
          }
        },
        () => {} // Empty onClose callback (dialogs close themselves now)
      );
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Context menu implementation can be added here
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderIcon className="h-5 w-5" />
          {MESSAGES.LIBRARY_TITLE}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Navigation Bar with Breadcrumbs */}
          <NavigationBar
            path={currentPath}
            onNavigateToBreadcrumb={navigateToBreadcrumb}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
          />

          {/* Actions Bar */}
          <ActionsBar
            onCreateFolder={handleCreateFolder}
            onAddTrack={handleAddTrack}
            currentFolderId={currentParentId || undefined}
          />

          {/* Folder Content */}
          {loading ? (
            <FolderSkeletonList />
          ) : currentFolders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FolderIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{MESSAGES.EMPTY_FOLDER}</p>
            </div>
          ) : (
            <VirtualizedSortableList
              parentId={currentParentId}
              onSelectFolder={(folderId: string, folderName: string) => handleFolderClick({ id: folderId, name: folderName })}
              selectedParentId={null}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

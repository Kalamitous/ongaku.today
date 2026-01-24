"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder as FolderIcon } from "lucide-react";

// Custom hooks
import { useLibraryNavigation } from "@/hooks/use-library-navigation";
import { useAllFoldersFromCache } from "@/hooks/queries/use-all-folders-from-cache";
import { folderUtils } from "@/utils/folder-utils";
import type { CreateTrackData } from "@/types/library.types";

// TanStack Query hooks
import { useFolders } from "@/hooks/queries/use-folders";
import { useCreateFolder } from "@/hooks/mutations/use-create-folder";
import { useUpdateFolder } from "@/hooks/mutations/use-update-folder";
import { useDeleteFolder } from "@/hooks/mutations/use-delete-folder";
import { useCreateTrack } from "@/hooks/mutations/use-create-track";

// Constants
import { ROOT_FOLDER, MESSAGES } from "@/constants/library";

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
  const { data: currentFolders = [], isLoading } = useFolders(currentParentId);

  // Actions hooks
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const createTrack = useCreateTrack();

  const handleFolderClick = (folder: { id: string; name: string }) => {
    navigateToFolder(folder.id, folder.name);
  };

  const handleCreateFolder = (folderName: string) => {
    if (folderName.trim()) {
      createFolder.mutate({ name: folderName.trim(), parent_id: currentParentId });
    }
  };

  const handleAddTrack = (data: CreateTrackData) => {
    createTrack.mutate(data);
  };

  const handleUpdateFolder = (folderId: string, folderName: string, selectedParentId: string | null) => {
    updateFolder.mutate({ 
      id: folderId, 
      data: { 
        name: folderName, 
        parent_id: selectedParentId
      }
    });
  };

const handleDeleteFolder = (folderId: string) => {
    if (folderId && folderId !== "root") {
      deleteFolder.mutate(folderId);
      // Navigate to parent folder after successful deletion
      if (currentParentId === folderId) {
        // Simple solution: just remove last item (deleted folder) from current path
        const parentPath = currentPath.slice(0, -1);
        setCurrentPath(parentPath);
      }
    }
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
            onDelete={handleDeleteFolder}
          />

          {/* Actions Bar */}
          <ActionsBar
            onCreateFolder={handleCreateFolder}
            onAddTrack={handleAddTrack}
            currentFolderId={currentParentId || undefined}
            onDeleteFolder={handleDeleteFolder}
          />

          {/* Folder Content */}
          {isLoading ? (
            <FolderSkeletonList />
          ) : currentFolders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FolderIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{MESSAGES.EMPTY_FOLDER}</p>
            </div>
          ) : (
            <VirtualizedSortableList
              folders={currentFolders} // Pass data instead of parentId
              parentId={currentParentId} // Keep for mutations
              onSelectFolder={(folderId: string, folderName: string) => handleFolderClick({ id: folderId, name: folderName })}
              selectedParentId={null}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

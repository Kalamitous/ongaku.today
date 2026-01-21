"use client";

import { useState } from "react";
import { createFolder as createFolderApi, updateFolder as updateFolderApi, deleteFolder as deleteFolderApi, getFolderById, getFolderPath } from "@/lib/api/folders";
import { folderUtils } from "@/utils/folder-utils";
import { useFolderStore } from "@/stores/folder-store";
import { VALIDATION, ROOT_FOLDER } from "@/constants/library";
import type { LibraryBreadcrumbItem } from "@/types/library.types";

/**
 * Hook for managing folder CRUD operations with optimistic updates
 * @returns Object containing folder actions and error state
 */
export function useFolderActions() {
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Get actions from Zustand store
  const addFolder = useFolderStore((state) => state.addFolder);
  const updateFolder = useFolderStore((state) => state.updateFolder);
  const removeFolder = useFolderStore((state) => state.removeFolder);
  const moveFolder = useFolderStore((state) => state.moveFolder);
  const loadFolders = useFolderStore((state) => state.loadFolders);

  /**
   * Creates a new folder with optimistic UI updates
   * @param folderName - Name of the folder to create
   * @param parentId - Parent folder ID (null for root)
   * @returns Promise<boolean> indicating success/failure
   */
  const createFolder = async (folderName: string, parentId: string | null) => {
    if (!folderUtils.isValidName(folderName)) {
      setActionError(VALIDATION.FOLDER_NAME_REQUIRED);
      return false;
    }

    // Get current user ID (assuming we have access to it, otherwise use placeholder)
    // In a real app, this would come from auth context
    const userId = "current-user"; // This should come from auth

    // Create optimistic folder with temporary ID
    const optimisticFolder = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: folderUtils.formatName(folderName),
      parent_id: parentId,
      user_id: userId,
      position: 'a0', // Default position for new folders
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Update UI immediately with optimistic folder
      addFolder(optimisticFolder);
      setActionError(null);

      // Create folder in background
      const newFolder = await createFolderApi({
        name: folderUtils.formatName(folderName),
        parent_id: parentId
      });
      
      // Replace optimistic folder with real data
      removeFolder(optimisticFolder.id); // Remove temp folder
      addFolder(newFolder); // Add real folder
      return true;
    } catch (err: unknown) {
      // Rollback: Remove optimistic folder
      removeFolder(optimisticFolder.id);
      const errorMessage = err instanceof Error ? err.message : "Failed to create folder";
      setActionError(errorMessage);
      
      return false;
    }
  };

  /**
   * Updates folder details (name and/or parent) with optimistic UI updates
   * @param folderId - ID of the folder to update
   * @param folderName - New name for the folder
   * @param selectedParentId - New parent ID (null for root)
   * @param onPathUpdate - Callback to update navigation path
   * @returns Promise<boolean> indicating success/failure
   */
  const updateFolderDetails = async (
    folderId: string, 
    folderName: string, 
    selectedParentId: string | null,
    onPathUpdate: (newPath: LibraryBreadcrumbItem[]) => void
  ) => {
    if (!folderUtils.isValidName(folderName)) {
      setActionError(VALIDATION.FOLDER_NAME_REQUIRED);
      return false;
    }

    // Get current folder data to store original values for rollback
    const folderCache = useFolderStore.getState().folderCache;
    const originalFolder = Array.from(folderCache.values())
      .flat()
      .find(f => f.id === folderId);
    
    if (!originalFolder) {
      setActionError(VALIDATION.FOLDER_NOT_FOUND);
      return false;
    }

    const originalName = originalFolder.name;
    const originalParentId = originalFolder.parent_id;

    try {
      // Apply optimistic updates immediately
      const updates = { 
        name: folderUtils.formatName(folderName),
        parent_id: selectedParentId 
      };
      
      updateFolder(folderId, updates);
      setActionError(null);
      
      // Handle folder move between parents (optimistic)
      if (originalParentId !== selectedParentId && originalParentId !== null) {
        await moveFolder(folderId, originalParentId, selectedParentId);
      }

      // Update path if we edited the current folder
      if (originalFolder.id === folderId) {
        onPathUpdate([ROOT_FOLDER]);
      }

      // Apply actual API update in background
      await updateFolderApi(folderId, updates);
      
      return true;
    } catch (err: unknown) {
      // Rollback: Restore original values
      const rollback = { 
        name: originalName,
        parent_id: originalParentId
      };
      
      updateFolder(folderId, rollback);
      
      // Rollback folder move if it was a move
      if (originalParentId !== selectedParentId && originalParentId !== null && selectedParentId !== null) {
        await moveFolder(folderId, selectedParentId, originalParentId);
      }
      
      const errorMessage = err instanceof Error ? err.message : "Folder update failed";
      setActionError(errorMessage);
      
      // Fall back to root path on error
      onPathUpdate([ROOT_FOLDER]);
      return false;
    }
  };

  /**
   * Deletes a folder with optimistic UI updates
   * @param folderId - ID of the folder to delete
   * @param onGoBack - Callback to navigate back after deletion
   * @param onCloseDialogs - Callback to close any open dialogs
   * @returns Promise<boolean> indicating success/failure
   */
  const deleteFolder = async (
    folderId: string, 
    onGoBack: () => void,
    onCloseDialogs: () => void
  ) => {
    // Get folder data for potential rollback
    const folderCache = useFolderStore.getState().folderCache;
    const folderToDelete = Array.from(folderCache.values())
      .flat()
      .find(f => f.id === folderId);
    
    if (!folderToDelete) {
      setActionError(VALIDATION.FOLDER_NOT_FOUND);
      return false;
    }

    try {
      // Apply optimistic delete immediately
      removeFolder(folderId);
      setActionError(null);
      
      // Update UI immediately, don't wait for API
      onGoBack();
      onCloseDialogs();
      
      // Apply actual API delete in background (non-blocking)
      deleteFolderApi(folderId).catch((err: unknown) => {
        // Handle API failure after the fact
        const errorMessage = err instanceof Error ? err.message : "Delete failed";
        setActionError(errorMessage);
        
        // Rollback: Restore deleted folder
        addFolder(folderToDelete);
      });
      
      return true;
    } catch (err: unknown) {
      // This catch block is for synchronous errors (shouldn't happen often)
      // Rollback: Restore deleted folder
      addFolder(folderToDelete);
      
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setActionError(errorMessage);
      
      return false;
    }
  };

  return {
    actionError,
    createFolder,
    updateFolderDetails,
    deleteFolder
  };
}
"use client";

import { useState, useEffect } from "react";
import { useAllFoldersFromCache } from "./queries/use-all-folders-from-cache";
import { folderUtils } from "@/utils/folder-utils";
import type { LibraryBreadcrumbItem } from "@/types/library.types";

/**
 * Hook for managing library navigation state and breadcrumb functionality
 * @param initialPath - Initial breadcrumb path for the navigation
 * @returns Navigation state and control functions
 */
export function useLibraryNavigation(initialPath: LibraryBreadcrumbItem[]) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  
  // Subscribe to folder cache changes for automatic path rebuilding
  const allFolders = useAllFoldersFromCache()
  
  // Rebuild path when folder relationships change
  useEffect(() => {
    if (currentPath.length > 1) {
      const currentFolderId = currentPath[currentPath.length - 1].id;
      const rebuiltPath = folderUtils.buildPathFromFolders(allFolders, currentFolderId);
      
      // Only update if path actually changed (prevent infinite loops)
      if (JSON.stringify(rebuiltPath) !== JSON.stringify(currentPath)) {
        setCurrentPath(rebuiltPath);
      }
    }
  }, [allFolders, currentPath.length]);

  const getCurrentParentId = (): string | null => {
    if (currentPath.length <= 1) {
      return null; // Root level
    }
    return currentPath[currentPath.length - 1].id;
  };
  
  const navigateTo = (folderId: string, folderName: string) => {
    setCurrentPath(prev => [...prev, { id: folderId, name: folderName }]);
  };
  
  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  };
  
  const goBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(prev => prev.slice(0, -1));
    }
  };
  
  return {
    currentPath,
    setCurrentPath,
    getCurrentParentId,
    navigateTo,
    navigateToBreadcrumb,
    goBack
  };
}

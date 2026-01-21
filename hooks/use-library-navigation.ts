"use client";

import { useState } from "react";
import type { LibraryBreadcrumbItem } from "@/types/library.types";

/**
 * Hook for managing library navigation state and breadcrumb functionality
 * @param initialPath - Initial breadcrumb path for the navigation
 * @returns Navigation state and control functions
 */
export function useLibraryNavigation(initialPath: LibraryBreadcrumbItem[]) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  
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

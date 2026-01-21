"use client";

import { useEffect, useState } from "react";
import { useFolderStore } from "@/stores/folder-store";

export function useFolderData(parentId?: string | null) {
  // Component-level loading state
  const [loading, setLoading] = useState(false);
  
  // Get reactive state from Zustand store
  const folderCache = useFolderStore((state) => state.folderCache);
  const error = useFolderStore((state) => state.error);
  const loadFolders = useFolderStore((state) => state.loadFolders);
  
  // Load data when parentId changes or on initial mount
  useEffect(() => {
    if (parentId === undefined) return; // Don't load when undefined
    
    setLoading(true);
    loadFolders(parentId).finally(() => {
      setLoading(false);
    });
  }, [parentId, loadFolders]);
  
  // Get folders for current parent from cache
  const folders = parentId === undefined ? [] : folderCache.get(parentId ?? null) || [];
  
  return {
    folders,
    loading,
    error,
  };
}
import { create } from 'zustand';
import { Folder } from '@/lib/api/folders';
import { getFolders, updateFolderPosition, moveFolder as moveFolderApi } from '@/lib/api/folders';
import { getPositionBetween } from '@/utils/fractional-indexing';

interface FolderStore {
  // State
  folderCache: Map<string | null, Folder[]>;
  error: string | null;
  
  // Actions
  loadFolders: (parentId?: string | null) => Promise<void>;
  addFolder: (folder: Folder) => void;
  updateFolder: (folderId: string, updates: Partial<Folder>) => void;
  removeFolder: (folderId: string) => void;
  moveFolder: (folderId: string, oldParentId: string | null, newParentId: string | null) => Promise<void>;
  reorderFolders: (parentId: string | null, oldIndex: number, newIndex: number) => void;
  updateFolderPosition: (folderId: string, position: string) => Promise<void>;
  
  // Selectors
  getFoldersByParent: (parentId?: string | null) => Folder[];
  getError: () => string | null;
}

/**
 * Zustand store for managing folder state and cache
 * Provides optimistic updates and centralized folder management
 */
export const useFolderStore = create<FolderStore>((set, get) => ({
  // Initial state
  folderCache: new Map(),
  error: null,
  
  // Actions
  /**
   * Loads folders from API and caches them by parent ID
   * @param parentId - Parent folder ID to load folders for (null for root)
   */
  loadFolders: async (parentId = null) => {
    const { folderCache } = get();
    
    // Check cache first
    if (folderCache.has(parentId)) {
      return;
    }
    set({ error: null });
    
    try {
      const folders = await getFolders(parentId);
      const sortedFolders = folders.toSorted((a, b) => 
        a.position < b.position
          ? -1
          : a.position > b.position
            ? 1
            : 0,
      );
      const newCache = new Map(folderCache);
      newCache.set(parentId, sortedFolders);
      set({ 
        folderCache: newCache
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to load folders"
      });
    }
  },
  
  /**
   * Adds a folder to the cache for its parent
   * @param folder - Folder object to add to cache
   */
  addFolder: (folder) => {
    const { folderCache } = get();
    const parentId = folder.parent_id;
    
    // Initialize cache entry if it doesn't exist
    if (!folderCache.has(parentId)) {
      folderCache.set(parentId, []);
    }
    
    const currentFolders = folderCache.get(parentId) || [];
    const existingIndex = currentFolders.findIndex(f => f.id === folder.id);
    
    const newCache = new Map(folderCache);
    
    if (existingIndex === -1) {
      // Add new folder
      newCache.set(parentId, [...currentFolders, folder]);
    } else {
      // Update existing folder
      newCache.set(parentId, [
        ...currentFolders.slice(0, existingIndex),
        folder,
        ...currentFolders.slice(existingIndex + 1)
      ]);
    }
    
    set({ folderCache: newCache });
  },
  
  /**
   * Updates folder properties across all cache entries
   * @param folderId - ID of the folder to update
   * @param updates - Partial folder object with properties to update
   */
  updateFolder: (folderId, updates) => {
    const { folderCache } = get();
    const newCache = new Map(folderCache);
    
    // Update folder in all cache entries
    for (const [cacheKey, cachedFolders] of folderCache.entries()) {
      const folderIndex = cachedFolders.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        const updatedFolders = [
          ...cachedFolders.slice(0, folderIndex),
          { ...cachedFolders[folderIndex], ...updates },
          ...cachedFolders.slice(folderIndex + 1)
        ];
        newCache.set(cacheKey, updatedFolders);
      }
    }
    
    set({ folderCache: newCache });
  },
  
  /**
   * Removes a folder from all cache entries
   * @param folderId - ID of the folder to remove
   */
  removeFolder: (folderId) => {
    const { folderCache } = get();
    const newCache = new Map(folderCache);
    
    // Remove folder from all cache entries
    for (const [cacheKey, cachedFolders] of folderCache.entries()) {
      const updatedFolders = cachedFolders.filter(f => f.id !== folderId);
      newCache.set(cacheKey, updatedFolders);
    }
    
    set({ folderCache: newCache });
  },
  
  /**
   * Moves a folder from one parent to another with cache consistency
   * Server calculates the position to prevent race conditions
   * @param folderId - ID of the folder to move
   * @param oldParentId - Current parent folder ID
   * @param newParentId - Target parent folder ID
   */
  moveFolder: async (folderId, oldParentId, newParentId) => {
    const state = get();
    const folderCache = state.folderCache;
    
    // Find the folder to move
    let folderToMove: Folder | undefined;
    for (const cachedFolders of folderCache.values()) {
      folderToMove = cachedFolders.find(f => f.id === folderId);
      if (folderToMove) break;
    }
    
    if (!folderToMove) return;
    
    // Optimistic update: update parent_id immediately
    const optimisticFolder = { ...folderToMove, parent_id: newParentId };
    const newCache = new Map(folderCache);
    
    // Remove from old parent cache
    if (newCache.has(oldParentId)) {
      const oldParentFolders = newCache.get(oldParentId) || [];
      const updatedOldParent = oldParentFolders.filter(f => f.id !== folderId);
      newCache.set(oldParentId, updatedOldParent);
    }
    
    // Add to new parent cache (position will be updated when API returns)
    if (!newCache.has(newParentId)) {
      newCache.set(newParentId, []);
    }
    const newParentFolders = newCache.get(newParentId) || [];
    newCache.set(newParentId, [...newParentFolders, optimisticFolder]);
    
    // Update the folder in all cache entries to ensure consistency
    for (const [cacheKey, cachedFolders] of newCache.entries()) {
      const folderIndex = cachedFolders.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        const updatedFolders = [
          ...cachedFolders.slice(0, folderIndex),
          optimisticFolder,
          ...cachedFolders.slice(folderIndex + 1)
        ];
        newCache.set(cacheKey, updatedFolders);
      }
    }
    
    set({ folderCache: newCache });
    
    // Call API to get server-calculated position
    try {
      const updatedFolder = await moveFolderApi(folderId, newParentId);
      
      // Update cache with the correct position from server
      const finalCache = new Map(get().folderCache);
      for (const [cacheKey, cachedFolders] of finalCache.entries()) {
        const folderIndex = cachedFolders.findIndex(f => f.id === folderId);
        if (folderIndex !== -1) {
          const updatedFolders = [
            ...cachedFolders.slice(0, folderIndex),
            updatedFolder,
            ...cachedFolders.slice(folderIndex + 1)
          ];
          finalCache.set(cacheKey, updatedFolders);
        }
      }
      
      set({ folderCache: finalCache });
    } catch (error) {
      // Rollback: restore original parent_id
      const rollbackCache = new Map(folderCache);
      set({ folderCache: rollbackCache });
      throw error;
    }
   },
   
   /**
    * Reorders folders within the same parent using fractional indexing
    * @param parentId - Parent folder ID
    * @param oldIndex - Current position index
    * @param newIndex - Target position index
    */
   reorderFolders: (parentId, oldIndex, newIndex) => {
     const cache = get().folderCache;
     const folders = cache.get(parentId) || [];
     const [movedFolder] = folders.splice(oldIndex, 1);
     
     // Calculate new position using fractional indexing
     let prevPosition: string | null = null;
     let nextPosition: string | null = null;
     
     if (newIndex > 0) {
       prevPosition = folders[newIndex - 1].position;
     }
     
     if (newIndex < folders.length) {
       nextPosition = folders[newIndex].position;
     }
     
     const newPosition = getPositionBetween(prevPosition, nextPosition);
     
     // Update the moved folder with new position
     folders.splice(newIndex, 0, { ...movedFolder, position: newPosition });
     
     // Optimistic update - apply immediately
     const newCache = new Map(cache);
     newCache.set(parentId, folders);
     set({ folderCache: newCache });
     
       // API call with rollback
      updateFolderPosition(movedFolder.id, newPosition).catch(() => {
       // Rollback on error
       set(state => ({
         folderCache: new Map(state.folderCache.set(parentId, cache.get(parentId) || []))
       }));
     });
   },
   
   /**
    * Updates folder position across all cache entries
    * @param folderId - ID of folder to update
    * @param position - New position value
    */
   updateFolderPosition: async (folderId, position) => {
     // Update position across all cache entries where folder exists
     const state = get();
     const newCache = new Map(state.folderCache);
     
     newCache.forEach((folders, parentId) => {
       const folderIndex = folders.findIndex(f => f.id === folderId);
       if (folderIndex !== -1) {
         folders[folderIndex] = { ...folders[folderIndex], position };
       }
     });
     
     set({ folderCache: newCache });
     
     try {
       await updateFolderPosition(folderId, position);
     } catch (error) {
       // Rollback - refresh affected parent
       const affectedParentId = Array.from(newCache.entries())
         .find(([_, folders]) => folders.some(f => f.id === folderId))?.[0];
       
       if (affectedParentId) {
         get().loadFolders(affectedParentId);
       }
     }
   },
   
   // Selectors
  /**
   * Retrieves folders for a specific parent from cache
   * @param parentId - Parent folder ID (null for root)
   * @returns Array of folders under the specified parent
   */
  getFoldersByParent: (parentId = null) => {
    const { folderCache } = get();
    return folderCache.get(parentId) || [];
  },
  
  /**
   * Gets the current error state from the store
   * @returns Current error message or null if no error
   */
  getError: () => {
    const { error } = get();
    return error;
  }
}));
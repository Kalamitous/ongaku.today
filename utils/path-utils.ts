import { folderUtils } from "@/utils/folder-utils";
import { useFolderStore } from "@/stores/folder-store";
import { ROOT_FOLDER } from "@/constants/library";
import type { LibraryBreadcrumbItem } from "@/types/library.types";

/**
 * Creates a callback function to update the navigation path after a folder operation
 * @param folderId - ID of the folder that was updated
 * @param setCurrentPath - Function to set the current navigation path
 * @returns Callback function that updates the path based on the current folder cache
 */
export function createPathUpdateCallback(
  folderId: string,
  setCurrentPath: (path: LibraryBreadcrumbItem[]) => void
) {
  return () => {
    // Get all folders from cache to build the new path
    const folderCache = useFolderStore.getState().folderCache;
    const allFolders = Array.from(folderCache.values()).flat();
    
    // Build new path from the updated folder
    const newPath = folderUtils.buildPathFromFolders(allFolders, folderId);
    
    // Add root to the beginning of the path
    const fullPath = [ROOT_FOLDER, ...newPath];
    
    // Update the navigation path
    setCurrentPath(fullPath);
  };
}
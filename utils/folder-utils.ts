import type { Folder, LibraryBreadcrumbItem } from "@/types/library.types";

export const folderUtils = {
  // Validation & formatting
  isValidName: (name: string): boolean => {
    return name.trim().length > 0;
  },
  
  formatName: (name: string): string => {
    return name.trim();
  },
  
  // Path helpers
  buildPathFromFolders: (folders: Folder[], folderId: string): LibraryBreadcrumbItem[] => {
    const path: LibraryBreadcrumbItem[] = [];
    
    let currentFolderId: string | null = folderId;
    
    while (currentFolderId !== null) {
      const folder = folders.find(f => f.id === currentFolderId);
      if (!folder) {
        break;
      }
      
      path.unshift({ id: folder.id, name: folder.name });
      currentFolderId = folder.parent_id;
    }
    
    return path;
  },
  
  getCurrentFolderId: (path: LibraryBreadcrumbItem[]): string | null => {
    if (path.length === 1) {
      return null; // Root level
    }
    return path[path.length - 1].id;
  },
  
  navigateToParent: (path: LibraryBreadcrumbItem[]): LibraryBreadcrumbItem[] => {
    if (path.length > 1) {
      return path.slice(0, -1);
    }
    return path;
  },
  
  // Transformations
  folderToBreadcrumb: (folder: Folder): LibraryBreadcrumbItem => {
    return {
      id: folder.id,
      name: folder.name
    };
  },
  
  createBreadcrumbPath: (root: LibraryBreadcrumbItem, folders: Folder[]): LibraryBreadcrumbItem[] => {
    return [
      root,
      ...folders.map(folder => folderUtils.folderToBreadcrumb(folder))
    ];
  }
};
import { useQueryClient } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import type { Folder } from '@/types/library.types';

/**
 * Hook to get all folders from the TanStack Query cache.
 * This retrieves all cached folder data across all parent levels,
 * which is useful for building complete paths or traversing the folder hierarchy.
 */
export function useAllFoldersFromCache(): Folder[] {
  const queryClient = useQueryClient();
  
  // Get all folder list queries from cache
  const allFolderQueries = queryClient.getQueriesData<Folder[]>({
    queryKey: folderKeys.lists(),
  });
  
  // Flatten all folders from all cached queries
  const allFolders: Folder[] = [];
  allFolderQueries.forEach(([, folders]) => {
    if (folders) {
      allFolders.push(...folders);
    }
  });
  
  return allFolders;
}
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { updateFolderPosition as updateFolderPositionApi } from '@/lib/api/folders';
import { getPositionBetween } from '@/utils/fractional-indexing';
import { sortFoldersByPosition } from '@/utils/sort-utils';
import type { Folder } from '@/lib/api/folders';

export function useReorderFolders() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      parentId, 
      oldIndex, 
      newIndex 
    }: { 
      parentId: string | null; 
      oldIndex: number; 
      newIndex: number 
    }) => {
      const currentData = queryClient.getQueryData<Folder[]>(
        folderKeys.list(parentId)
      );
      
      if (!currentData) throw new Error('No data found');
      
      // Apply the same sorting that useFolders uses for consistency
      const sortedFolders = sortFoldersByPosition(currentData);
      const movedFolder = sortedFolders[newIndex];
      
      // Call the API to update position on server
      await updateFolderPositionApi(movedFolder.id, movedFolder.position);
      
      return { folderId: movedFolder.id, position: movedFolder.position };
    },
    
    onMutate: async ({ parentId, oldIndex, newIndex }) => {
      await queryClient.cancelQueries({ 
        queryKey: folderKeys.list(parentId) 
      });
      
      const previousFolders = queryClient.getQueryData<Folder[]>(
        folderKeys.list(parentId)
      );
      
      if (!previousFolders) return { previousFolders, parentId };
      
      // Apply the same sorting that useFolders uses for consistency
      const sortedFolders = sortFoldersByPosition(previousFolders);
      const movedFolder = sortedFolders[oldIndex];
      
      let prevPosition: string | null = null;
      let nextPosition: string | null = null;
      
      // Account for the fact that when we remove the moved item, indices shift
      if (oldIndex < newIndex) {
        prevPosition = sortedFolders[newIndex].position;
        if (newIndex < sortedFolders.length - 1) {
          nextPosition = sortedFolders[newIndex + 1].position;
        }
      } else if (oldIndex > newIndex) {
        nextPosition = sortedFolders[newIndex].position;
        if (newIndex > 0) {
          prevPosition = sortedFolders[newIndex - 1].position;
        }
      } else {
        return { folderId: movedFolder.id, position: movedFolder.position };
      }
      
      const newPosition = getPositionBetween(prevPosition, nextPosition);
      
      // Only update the position field - let the query's select function handle sorting
      const updatedFolders = previousFolders.map(folder => 
        folder.id === movedFolder.id 
          ? { ...folder, position: newPosition }
          : folder
      );
      
      queryClient.setQueryData(
        folderKeys.list(parentId),
        updatedFolders
      );
      
      return { previousFolders, parentId };
    },
    
    onError: (error, variables, context) => {
      if (!context || !context.previousFolders) return;
      queryClient.setQueryData(
        folderKeys.list(context.parentId),
        context.previousFolders
      );
    },
  });
}
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { createFolder as createFolderApi } from '@/lib/api/folders';
import { getPositionBetween } from '@/utils/fractional-indexing';
import { sortFoldersByPosition } from '@/utils/sort-utils';
import type { CreateFolderData } from '@/lib/api/folders';
import type { Folder } from '@/lib/api/folders';

export function useCreateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateFolderData) => createFolderApi(data),
    
    onMutate: async (data) => {
      const parentId = data.parent_id || null;
      
      await queryClient.cancelQueries({ 
        queryKey: folderKeys.list(parentId) 
      });
      
      const previousFolders = queryClient.getQueryData<Folder[]>(
        folderKeys.list(parentId)
      );
      
      // Apply same sorting that useFolders uses for consistency
      const currentFolders = sortFoldersByPosition(previousFolders || []);
      
      // Calculate position for new folder (at end of list)
      const newPosition = currentFolders.length === 0 
        ? 'a0' 
        : getPositionBetween(
            currentFolders[currentFolders.length - 1].position,
            null
          );
      
      const optimisticFolder = {
        id: `temp-${Date.now()}`,
        name: data.name,
        user_id: 'current-user',
        parent_id: parentId,
        position: newPosition
      } as Folder;
      
      queryClient.setQueryData(
        folderKeys.list(parentId),
        (old: Folder[] | undefined) => 
          [...(old || []), optimisticFolder]
      );
      
      return { previousFolders, parentId, tempId: optimisticFolder.id };
    },
    
    onSuccess: (newFolder, variables, context) => {
      if (!context) return;
      
      queryClient.setQueryData(
        folderKeys.list(context.parentId),
        (old: Folder[] | undefined) => 
          (old || []).map(f => 
            f.id === context.tempId ? newFolder : f
          )
      );
    },
    
    onError: (error, variables, context) => {
      if (!context) return;
      queryClient.setQueryData(
        folderKeys.list(context.parentId),
        context.previousFolders
      );
    },
  });
}
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { moveFolder as moveFolderApi } from '@/lib/api/folders';
import type { Folder } from '@/lib/api/folders';

export function useMoveFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ folderId, newParentId }: { 
      folderId: string; 
      newParentId: string | null 
    }) => moveFolderApi(folderId, newParentId),
    
    onMutate: async ({ folderId, newParentId }) => {
      await queryClient.cancelQueries({ 
        queryKey: folderKeys.all 
      });
      
      let folderToMove: Folder | undefined;
      queryClient
        .getQueriesData<Folder[]>({ queryKey: folderKeys.lists() })
        .forEach(([, data]) => {
          if (!folderToMove) {
            folderToMove = data?.find(f => f.id === folderId);
          }
        });
      
      if (!folderToMove) throw new Error('Folder not found');
      
      const oldParentId = folderToMove.parent_id;
      const optimisticFolder = { ...folderToMove, parent_id: newParentId };
      
      const previousData: Record<string, Folder[]> = {};
      queryClient
        .getQueriesData<Folder[]>({ queryKey: folderKeys.lists() })
        .forEach(([queryKey, data]) => {
          previousData[JSON.stringify(queryKey)] = data || [];
        });
      
      queryClient.setQueriesData<Folder[]>({ 
        queryKey: folderKeys.lists() 
      }, (old) => 
        (old || []).filter(f => f.id !== folderId)
      );
      
      const newParentKey = folderKeys.list(newParentId);
      queryClient.setQueryData(
        newParentKey,
        (old: Folder[] | undefined) => 
          [...(old || []), optimisticFolder]
      );
      
      return { previousData, oldParentId, folderId };
    },

    onError: (error, variables, context) => {
      if (!context) return;
      Object.entries(context.previousData).forEach(([key, data]) => {
        queryClient.setQueryData(JSON.parse(key), data);
      });
    },
  });
}

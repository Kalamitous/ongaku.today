import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { deleteFolder as deleteFolderApi } from '@/lib/api/folders';
import type { Folder } from '@/lib/api/folders';

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteFolderApi(id),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ 
        queryKey: folderKeys.all 
      });
      
      const previousData: Record<string, Folder[]> = {};
      queryClient
        .getQueriesData<Folder[]>({ 
          queryKey: folderKeys.lists() 
        })
        .forEach(([queryKey, data]) => {
          previousData[JSON.stringify(queryKey)] = data || [];
        });
      
      queryClient.setQueriesData<Folder[]>({ 
        queryKey: folderKeys.lists() 
      }, (old) => 
        (old || []).filter(f => f.id !== id)
      );
      
      return { previousData };
    },
    
    onError: (error, variables, context) => {
      if (!context) return;
      Object.entries(context.previousData).forEach(([key, data]) => {
        queryClient.setQueryData(JSON.parse(key), data);
      });
    },
  });
}

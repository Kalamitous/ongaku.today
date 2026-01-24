import { useMutation, useQueryClient } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { updateFolder as updateFolderApi } from '@/lib/api/folders';
import type { UpdateFolderData } from '@/lib/api/folders';
import type { Folder } from '@/lib/api/folders';

export function useUpdateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFolderData }) => 
      updateFolderApi(id, data),
    
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: folderKeys.all 
      });
      
      // Find current folder data
      let currentFolder: Folder | null = null;
      const previousData: Record<string, Folder[]> = {};
      
      queryClient
        .getQueriesData<Folder[]>({ 
          queryKey: folderKeys.lists() 
        })
        .forEach(([queryKey, folderData]) => {
          previousData[JSON.stringify(queryKey)] = folderData || [];
          
          // Find current folder during this pass
          if (!currentFolder) {
            currentFolder = (folderData || []).find(f => f.id === id) || null;
          }
        });
      
      const oldParentId = (currentFolder as Folder | null)?.parent_id;
      const newParentId = data.parent_id as string | null | undefined;
      
      // Handle folder move specifically
      if (oldParentId !== newParentId && oldParentId !== undefined) {
        // Remove from old parent's list
        queryClient.setQueryData<Folder[]>(folderKeys.list(oldParentId), (old) => 
          (old || []).filter(f => f.id !== id)
        );
        
        // Add to new parent's list with updated data
        const updatedFolder = { ...currentFolder!, ...data };
        queryClient.setQueryData<Folder[]>(folderKeys.list(newParentId || null), (old) => {
          const existing = old || [];
          // Avoid duplicates
          if (!existing.find(f => f.id === id)) {
            return [...existing, updatedFolder];
          }
          return existing.map(f => f.id === id ? updatedFolder : f);
        });
      } else {
        // Simple name update - update in all lists
        queryClient.setQueriesData<Folder[]>({ 
          queryKey: folderKeys.lists() 
        }, (old) => 
          (old || []).map(f => 
            f.id === id ? { ...f, ...data } : f
          )
        );
      }
      
      return { previousData, oldParentId, newParentId };
    },
    
    onError: (error, variables, context) => {
      if (!context) return;
      Object.entries(context.previousData).forEach(([key, data]) => {
        queryClient.setQueryData(JSON.parse(key), data);
      });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

// Generic interface for items with parent reference and position
interface ItemWithParent {
  id: string;
}

interface ItemWithParentAndPosition extends ItemWithParent {
  position: string;
}

// Generic interface for move API
interface MoveFunction<T extends ItemWithParent> {
  (itemId: string, newParentId: string | null): Promise<T>;
}

// Generic interface for query keys
interface QueryKeys {
  list: (parentId: string | null) => readonly unknown[];
  lists?: () => readonly unknown[];
}

// Generic interface for getting current parent
interface GetCurrentParentId<T extends ItemWithParent> {
  (item: T): string | null;
}

interface UseMoveItemsProps<T extends ItemWithParent> {
  queryKeys: QueryKeys;
  moveItem: MoveFunction<T>;
  getCurrentParentId: GetCurrentParentId<T>;
}

export function useMoveItems<T extends ItemWithParent>({
  queryKeys,
  moveItem,
  getCurrentParentId,
}: UseMoveItemsProps<T>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      itemId, 
      newParentId 
    }: { 
      itemId: string; 
      newParentId: string | null; 
    }) => moveItem(itemId, newParentId),
    
    onMutate: async ({ itemId, newParentId }) => {
      // Cancel all relevant queries
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.lists?.() || queryKeys.list(newParentId)
      });
      
      let itemToMove: T | undefined;
      let oldParentId: string | null = null;
      
      // Find the item across all cached lists
      const queries = queryClient.getQueriesData<T[]>({ 
        queryKey: queryKeys.lists?.() 
      });
      
      queries.forEach(([, data]) => {
        if (!itemToMove && data) {
          const found = data.find(item => item.id === itemId);
          if (found) {
            itemToMove = found;
            oldParentId = getCurrentParentId(found);
          }
        }
      });
      
      if (!itemToMove) throw new Error('Item not found');
      
      // Create optimistic copy with updated parent
      const optimisticItem = { 
        ...itemToMove,
        ...(newParentId !== undefined && { [getParentField(itemToMove)]: newParentId })
      };
      
      // Store previous state for rollback
      const previousData: Record<string, T[]> = {};
      queries.forEach(([queryKey, data]) => {
        previousData[JSON.stringify(queryKey)] = data || [];
      });
      
      // Remove from all lists
      queryClient.setQueriesData<T[]>({ 
        queryKey: queryKeys.lists?.() 
      }, (old) => (old || []).filter(item => item.id !== itemId));
      
      // Add to new parent list
      const newParentKey = queryKeys.list(newParentId);
      queryClient.setQueryData(
        newParentKey,
        (old: T[] | undefined) => 
          [...(old || []), optimisticItem]
      );
      
      return { previousData, oldParentId, itemId };
    },

    onError: (error, variables, context) => {
      if (!context) return;
      // Rollback all changes
      Object.entries(context.previousData).forEach(([key, data]) => {
        queryClient.setQueryData(JSON.parse(key), data);
      });
    },
  });
}

// Helper to determine the parent field name
function getParentField(item: any): string {
  if ('parent_id' in item) return 'parent_id';
  if ('folder_id' in item) return 'folder_id';
  throw new Error('Item does not have a parent field');
}
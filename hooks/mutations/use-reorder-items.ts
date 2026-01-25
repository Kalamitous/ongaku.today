import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPositionBetween } from '@/utils/fractional-indexing';

// Generic interface for items with position
interface ItemWithPosition {
  id: string;
  position: string;
}

// Generic interface for sort functions
interface SortFunction<T extends ItemWithPosition> {
  (items: T[]): T[];
}

// Generic interface for position update API
interface UpdatePositionFunction<T extends ItemWithPosition> {
  (id: string, position: string): Promise<T>;
}

// Generic interface for query keys
interface QueryKeys {
  list: (parentId: string | null) => readonly unknown[];
  lists?: () => readonly unknown[];
}

// Helper function to calculate new position between items
function calculateNewPosition<T extends ItemWithPosition>(
  sortedItems: T[], 
  oldIndex: number, 
  newIndex: number
): { position: string; noMovement: boolean } {
  if (oldIndex === newIndex) {
    const movedItem = sortedItems[oldIndex];
    return { position: movedItem.position, noMovement: true };
  }

  let prevPos: string | null = null;
  let nextPos: string | null = null;
  
  // Account for the fact that when we remove the moved item, indices shift
  if (oldIndex < newIndex) {
    prevPos = sortedItems[newIndex].position;
    if (newIndex < sortedItems.length - 1) {
      nextPos = sortedItems[newIndex + 1].position;
    }
  } else if (oldIndex > newIndex) {
    nextPos = sortedItems[newIndex].position;
    if (newIndex > 0) {
      prevPos = sortedItems[newIndex - 1].position;
    }
  }

  const newPosition = getPositionBetween(prevPos, nextPos);
  return { position: newPosition, noMovement: false };
}

interface UseReorderItemsProps<T extends ItemWithPosition> {
  queryKeys: QueryKeys;
  updatePosition: UpdatePositionFunction<T>;
  sortItems: SortFunction<T>;
  // Optional: for handling cross-parent reordering
  getCurrentParentId?: (item: T) => string | null;
  getNewParentId?: (oldParentId: string | null, newIndex: number, items: T[]) => string | null;
}

export function useReorderItems<T extends ItemWithPosition>({
  queryKeys,
  updatePosition,
  sortItems,
  getCurrentParentId,
  getNewParentId,
}: UseReorderItemsProps<T>) {
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
      const currentData = queryClient.getQueryData<T[]>(
        queryKeys.list(parentId)
      );
      
      if (!currentData) throw new Error('No data found');
      
      // Apply sorting for consistency
      const sortedItems = sortItems(currentData);
      const movedItem = sortedItems[oldIndex];
      
      // Calculate new position
      const { position, noMovement } = calculateNewPosition(sortedItems, oldIndex, newIndex);
      
      if (noMovement) {
        return { itemId: movedItem.id, position: movedItem.position };
      }
      
      // Call the API to update position on server
      await updatePosition(movedItem.id, position);
      
      return { itemId: movedItem.id, position };
    },
    
    onMutate: async ({ parentId, oldIndex, newIndex }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.list(parentId) 
      });
      
      const previousItems = queryClient.getQueryData<T[]>(
        queryKeys.list(parentId)
      );
      
      if (!previousItems) return { previousItems, parentId };
      
      // Apply sorting for consistency
      const sortedItems = sortItems(previousItems);
      const movedItem = sortedItems[oldIndex];
      
      // Calculate new position (same logic as mutationFn)
      const { position, noMovement } = calculateNewPosition(sortedItems, oldIndex, newIndex);
      
      if (noMovement) {
        return { previousItems, parentId };
      }
      
      // Only update the position field - let the query's select function handle sorting
      const updatedItems = previousItems.map(item => 
        item.id === movedItem.id 
          ? { ...item, position }
          : item
      );
      
      queryClient.setQueryData(
        queryKeys.list(parentId),
        updatedItems
      );
      
      return { previousItems, parentId };
    },
    
    onError: (error, variables, context) => {
      if (!context || !context.previousItems) return;
      queryClient.setQueryData(
        queryKeys.list(context.parentId),
        context.previousItems
      );
    },
  });
}
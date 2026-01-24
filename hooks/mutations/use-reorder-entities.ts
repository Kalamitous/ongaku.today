import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getPositionBetween } from '@/utils/fractional-indexing';

/**
 * Configuration for generic entity reordering
 */
export interface ReorderConfig<T> {
  /** Name of the entity (for error messages) */
  entityName: string;
  /** Query keys for the entity */
  queryKeys: {
    list: (parentId: string | null) => readonly (string | null)[];
  };
  /** API function to update position */
  updatePositionApi: (id: string, position: string) => Promise<unknown>;
  /** Sort function for the entity */
  sortFunction: (items: T[]) => T[];
  /** Function to extract parent ID from mutation variables */
  getParentId: (variables: ReorderVariables) => string | null;
}

export interface ReorderVariables {
  parentId?: string | null;
  folderId?: string | null;
  oldIndex: number;
  newIndex: number;
}

export interface ReorderContext<T> {
  previousItems: T[];
  parentId: string | null;
}

/**
 * Generic hook for reordering entities with fractional indexing
 * 
 * This hook encapsulates the common pattern of reordering items with:
 * - Optimistic updates
 * - Fractional indexing for position management  
 * - Rollback on error
 * - Consistent sorting
 * 
 * @param config Configuration object for the entity type
 * @returns Mutation hook for reordering entities
 */
export function useReorderEntities<T extends { id: string; position: string }>(
  config: ReorderConfig<T>
) {
  const queryClient = useQueryClient();
  
  return useMutation<unknown, Error, ReorderVariables, ReorderContext<T>>({
    mutationFn: async (variables) => {
      const parentId = config.getParentId(variables);
      
      const currentData = queryClient.getQueryData<T[]>(
        config.queryKeys.list(parentId)
      );
      
      if (!currentData) {
        throw new Error(`No ${config.entityName} data found`);
      }
      
      // Apply the same sorting that the query uses for consistency
      const sortedItems = config.sortFunction(currentData);
      const movedItem = sortedItems[variables.newIndex];
      
      // Call the API to update position on server
      await config.updatePositionApi(movedItem.id, movedItem.position);
      
      return { itemId: movedItem.id, position: movedItem.position };
    },
    
    onMutate: async (variables): Promise<ReorderContext<T>> => {
      const parentId = config.getParentId(variables);
      
      await queryClient.cancelQueries({ 
        queryKey: config.queryKeys.list(parentId) 
      });
      
      const previousItems = queryClient.getQueryData<T[]>(
        config.queryKeys.list(parentId)
      );
      
      if (!previousItems) {
        throw new Error(`No ${config.entityName} data found`);
      }
      
      // Apply the same sorting that the query uses for consistency
      const sortedItems = config.sortFunction(previousItems);
      const movedItem = sortedItems[variables.oldIndex];
      
      let prevPosition: string | null = null;
      let nextPosition: string | null = null;
      
      // Account for the fact that when we remove the moved item, indices shift
      if (variables.oldIndex < variables.newIndex) {
        prevPosition = sortedItems[variables.newIndex].position;
        if (variables.newIndex < sortedItems.length - 1) {
          nextPosition = sortedItems[variables.newIndex + 1].position;
        }
      } else if (variables.oldIndex > variables.newIndex) {
        nextPosition = sortedItems[variables.newIndex].position;
        if (variables.newIndex > 0) {
          prevPosition = sortedItems[variables.newIndex - 1].position;
        }
      } else {
        // No movement needed
        return { previousItems, parentId };
      }
      
      const newPosition = getPositionBetween(prevPosition, nextPosition);
      
      // Only update the position field - let the query's select function handle sorting
      const updatedItems = previousItems.map(item => 
        item.id === movedItem.id 
          ? { ...item, position: newPosition }
          : item
      );
      
      queryClient.setQueryData(
        config.queryKeys.list(parentId),
        updatedItems
      );
      
      return { previousItems, parentId };
    },
    
    onError: (error, variables, context) => {
      if (!context || !context.previousItems) return;
      
      queryClient.setQueryData(
        config.queryKeys.list(context.parentId),
        context.previousItems
      );
    },
  });
}
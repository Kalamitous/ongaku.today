import { useReorderEntities } from './use-reorder-entities';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { updateFolderPosition as updateFolderPositionApi } from '@/lib/api/folders';
import { sortByPosition } from '@/utils/sort-utils';
import type { Folder } from '@/lib/api/folders';
import type { ReorderVariables } from './use-reorder-entities';

export function useReorderFolders() {
  return useReorderEntities<Folder>({
    entityName: 'folder',
    queryKeys: {
      list: (parentId: string | null) => folderKeys.list(parentId),
    },
    updatePositionApi: updateFolderPositionApi,
    sortFunction: sortByPosition,
    getParentId: (variables: ReorderVariables) => variables.parentId || null,
  });
}
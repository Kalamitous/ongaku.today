import { folderKeys } from '@/lib/tanstack-query/keys';
import { updateFolderPosition as updateFolderPositionApi } from '@/lib/api/folders';
import { sortByPosition } from '@/utils/sort-utils';
import { useReorderItems } from './use-reorder-items';
import type { Folder } from '@/lib/api/folders';

export function useReorderFolders() {
  return useReorderItems<Folder>({
    queryKeys: folderKeys,
    updatePosition: updateFolderPositionApi,
    sortItems: sortByPosition,
  });
}
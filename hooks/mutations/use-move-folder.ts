import { folderKeys } from '@/lib/tanstack-query/keys';
import { moveFolder as moveFolderApi } from '@/lib/api/folders';
import { useMoveItems } from './use-move-items';
import type { Folder } from '@/lib/api/folders';

export function useMoveFolder() {
  return useMoveItems<Folder>({
    queryKeys: folderKeys,
    moveItem: moveFolderApi,
    getCurrentParentId: (folder) => folder.parent_id,
  });
}

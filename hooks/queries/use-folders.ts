import { useQuery } from '@tanstack/react-query';
import { folderKeys } from '@/lib/tanstack-query/keys';
import { getFolders } from '@/lib/api/folders';
import { sortFoldersByPosition } from '@/utils/sort-utils';

export function useFolders(parentId: string | null = null) {
  return useQuery({
    queryKey: folderKeys.list(parentId),
    queryFn: () => getFolders(parentId),
    select: sortFoldersByPosition,
  });
}

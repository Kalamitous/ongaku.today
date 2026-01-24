import { useReorderEntities } from './use-reorder-entities';
import { trackKeys } from '@/lib/tanstack-query/keys';
import { updateTrackPosition as updateTrackPositionApi } from '@/lib/api/tracks';
import { sortByPosition } from '@/utils/sort-utils';
import type { Track } from '@/types/library.types';
import type { ReorderVariables } from './use-reorder-entities';

export function useReorderTracks() {
  return useReorderEntities<Track>({
    entityName: 'track',
    queryKeys: {
      list: (folderId: string | null) => trackKeys.list(folderId),
    },
    updatePositionApi: updateTrackPositionApi,
    sortFunction: sortByPosition,
    getParentId: (variables: ReorderVariables) => {
      // For tracks, we use folderId as the parent context
      // This mapping allows the generic hook to work with track-specific parameter naming
      return variables.folderId || variables.parentId || null;
    },
  });
}
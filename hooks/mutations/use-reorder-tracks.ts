import { trackKeys } from '@/lib/tanstack-query/keys';
import { updateTrackPosition as updateTrackPositionApi } from '@/lib/api/tracks';
import { sortByPosition } from '@/utils/sort-utils';
import { useReorderItems } from './use-reorder-items';
import type { Track } from '@/types/library.types';

export function useReorderTracks() {
  return useReorderItems<Track>({
    queryKeys: trackKeys,
    updatePosition: updateTrackPositionApi,
    sortItems: sortByPosition,
  });
}
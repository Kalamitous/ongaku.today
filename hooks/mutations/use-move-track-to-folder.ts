import { trackKeys } from '@/lib/tanstack-query/keys';
import { moveTrackToFolder as moveTrackToFolderApi } from '@/lib/api/tracks';
import { useMoveItems } from './use-move-items';
import type { Track } from '@/types/library.types';

export function useMoveTrackToFolder() {
  return useMoveItems<Track>({
    queryKeys: trackKeys,
    moveItem: moveTrackToFolderApi,
    getCurrentParentId: (track) => track.folder_id,
  });
}
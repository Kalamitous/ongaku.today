import { useQuery } from '@tanstack/react-query';
import { trackKeys } from '@/lib/tanstack-query/keys';
import { getTracks } from '@/lib/api/tracks';
import { sortTracksByPosition } from '@/utils/sort-utils';

export function useTracks(folderId: string | null = null) {
  return useQuery({
    queryKey: trackKeys.list(folderId),
    queryFn: () => getTracks(folderId),
    select: sortTracksByPosition,
  });
}

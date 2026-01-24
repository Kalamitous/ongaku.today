import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackKeys } from '@/lib/tanstack-query/keys';
import { createTrack as createTrackApi } from '@/lib/api/tracks';
import { getPositionBetween } from '@/utils/fractional-indexing';
import { sortTracksByPosition } from '@/utils/sort-utils';
import type { CreateTrackData } from '@/types/library.types';
import type { Track } from '@/types/library.types';

export function useCreateTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTrackData) => createTrackApi(data),
    
    onMutate: async (data) => {
      const folderId = data.folder_id;
      
      await queryClient.cancelQueries({ 
        queryKey: trackKeys.list(folderId) 
      });
      
      const previousTracks = queryClient.getQueryData<Track[]>(
        trackKeys.list(folderId)
      );
      
// Apply same sorting that useTracks uses for consistency
      const currentTracks = sortTracksByPosition(previousTracks || []);
      
      // Calculate position for new track (at end of list)
      const newPosition = currentTracks.length === 0 
        ? 'a0' 
        : getPositionBetween(
            currentTracks[currentTracks.length - 1].position,
            null
          );
      
      const optimisticTrack: Track = {
        id: `temp-${Date.now()}`,
        source: data.source,
        source_id: data.source_id,
        title: data.title,
        artist: data.artist || null,
        folder_id: folderId,
        user_id: 'current-user',
        position: newPosition,
      };
      
      queryClient.setQueryData(
        trackKeys.list(folderId),
        (old: Track[] | undefined) => 
          [...(old || []), optimisticTrack]
      );
      
      return { previousTracks, folderId, tempId: optimisticTrack.id };
    },
    
    onSuccess: (newTrack, variables, context) => {
      if (!context) return;
      queryClient.setQueryData(
        trackKeys.list(context.folderId),
        (old: Track[] | undefined) => 
          (old || []).map(t => 
            t.id === context.tempId ? newTrack : t
          )
      );
    },
    
    onError: (error, variables, context) => {
      if (!context) return;
      queryClient.setQueryData(
        trackKeys.list(context.folderId),
        context.previousTracks
      );
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackKeys } from '@/lib/tanstack-query/keys';
import { createTrack as createTrackApi } from '@/lib/api/tracks';
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
      
      // Apply sorting for consistency (though tracks don't use position currently)
      const sortedTracks = sortTracksByPosition(previousTracks || []);
      
      const optimisticTrack: Track = {
        id: `temp-${Date.now()}`,
        source: data.source,
        source_id: data.source_id,
        title: data.title,
        artist: data.artist || null,
        folder_id: folderId,
        user_id: 'current-user',
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

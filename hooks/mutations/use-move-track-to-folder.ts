import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackKeys } from '@/lib/tanstack-query/keys';
import { moveTrackToFolder as moveTrackToFolderApi } from '@/lib/api/tracks';
import type { Track } from '@/types/library.types';

export function useMoveTrackToFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      trackId, 
      newFolderId 
    }: { 
      trackId: string; 
      newFolderId: string | null; 
    }) => {
      const result = await moveTrackToFolderApi(trackId, newFolderId);
      return result;
    },
    
    onMutate: async ({ trackId, newFolderId }) => {
      // Get the current track to determine old folder
      const currentTrack = queryClient.getQueryData<Track[]>(
        trackKeys.list(newFolderId)
      )?.find(t => t.id === trackId);
      
      if (!currentTrack) return;
      
      const oldFolderId = currentTrack.folder_id;
      
      // Cancel all relevant queries
      await queryClient.cancelQueries({ queryKey: trackKeys.list(oldFolderId) });
      await queryClient.cancelQueries({ queryKey: trackKeys.list(newFolderId) });
      
      const oldTracks = queryClient.getQueryData<Track[]>(trackKeys.list(oldFolderId)) || [];
      const newTracks = queryClient.getQueryData<Track[]>(trackKeys.list(newFolderId)) || [];
      
      const movedTrack = oldTracks.find(t => t.id === trackId);
      
      if (!movedTrack) return { oldTracks, newTracks, oldFolderId, newFolderId };
      
      // Remove from old folder
      queryClient.setQueryData(
        trackKeys.list(oldFolderId),
        oldTracks.filter(t => t.id !== trackId)
      );
      
      // Add to new folder (will be updated with real position after mutation)
      queryClient.setQueryData(
        trackKeys.list(newFolderId),
        [...newTracks, { ...movedTrack, folder_id: newFolderId }]
      );
      
      return { oldTracks, newTracks, newFolderId };
    },
    
    onSuccess: (updatedTrack) => {
      // Update the moved track with its new position
      queryClient.setQueriesData(
        { queryKey: trackKeys.list(updatedTrack.folder_id) },
        (oldData: Track[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(track => 
            track.id === updatedTrack.id ? updatedTrack : track
          );
        }
      );
    },
    
    onError: (error, variables, context) => {
      if (!context) return;
      
      // Rollback changes
      queryClient.setQueryData(
        trackKeys.list(context.oldFolderId || null),
        context.oldTracks
      );
      queryClient.setQueryData(
        trackKeys.list(context.newFolderId),
        context.newTracks
      );
    },
  });
}
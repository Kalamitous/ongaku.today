import { useEffect, useState } from "react";
import { useTrackStore } from "@/stores/track-store";

export function useTrackData(folderId?: string | null) {
  // Component-level loading state
  const [loading, setLoading] = useState(false);
  
  // Get reactive state from Zustand store
  const trackCache = useTrackStore((state) => state.trackCache);
  const error = useTrackStore((state) => state.error);
  const loadTracks = useTrackStore((state) => state.loadTracks);
  
  // Load data when folderId changes or on initial mount
  useEffect(() => {
    if (folderId === undefined) return; // Don't load when undefined
    
    setLoading(true);
    loadTracks(folderId).finally(() => {
      setLoading(false);
    });
  }, [folderId, loadTracks]);
  
  // Get tracks for current folder from cache
  const tracks = folderId === undefined ? [] : trackCache.get(folderId ?? null) || [];
  
  return {
    tracks,
    loading,
    error,
  };
}
import { create } from 'zustand';
import type { Track } from '@/types/library.types';
import { getTracks, createTrack, updateTrack, deleteTrack } from '@/lib/api/tracks';

interface TrackStore {
  // State
  trackCache: Map<string | null, Track[]>;
  error: string | null;
  
  // Actions
  loadTracks: (folderId?: string | null) => Promise<void>;
  addTrack: (track: Track) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  removeTrack: (trackId: string) => void;
  
  // Selectors
  getTracksByFolder: (folderId?: string | null) => Track[];
  getError: () => string | null;
}

/**
 * Zustand store for managing track state and cache
 * Provides optimistic updates and centralized track management
 */
export const useTrackStore = create<TrackStore>((set, get) => ({
  // Initial state
  trackCache: new Map(),
  error: null,
  
  // Actions
  loadTracks: async (folderId = null) => {
    const { trackCache } = get();
    
    // Check cache first
    if (trackCache.has(folderId)) {
      return;
    }
    set({ error: null });
    
    try {
      const tracks = await getTracks(folderId);
      const newCache = new Map(trackCache);
      newCache.set(folderId, tracks);
      set({ 
        trackCache: newCache
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : "Failed to load tracks"
      });
    }
  },
  
  addTrack: (track) => {
    const { trackCache } = get();
    const parentId = track.folder_id || null;
    const currentTracks = trackCache.get(parentId) || [];
    
    const newCache = new Map(trackCache);
    newCache.set(parentId, [...currentTracks, track]);
    
    set({ trackCache: newCache });
  },
  
  updateTrack: (trackId, updates) => {
    const { trackCache } = get();
    const newCache = new Map(trackCache);
    
    // Update track in all cache entries
    for (const [cacheKey, cachedTracks] of trackCache.entries()) {
      const trackIndex = cachedTracks.findIndex(t => t.id === trackId);
      if (trackIndex !== -1) {
        const updatedTracks = [
          ...cachedTracks.slice(0, trackIndex),
          { ...cachedTracks[trackIndex], ...updates },
          ...cachedTracks.slice(trackIndex + 1)
        ];
        newCache.set(cacheKey, updatedTracks);
      }
    }
    
    set({ trackCache: newCache });
  },
  
  removeTrack: (trackId) => {
    const { trackCache } = get();
    const newCache = new Map(trackCache);
    
    // Remove track from all cache entries
    for (const [cacheKey, cachedTracks] of trackCache.entries()) {
      const updatedTracks = cachedTracks.filter(t => t.id !== trackId);
      newCache.set(cacheKey, updatedTracks);
    }
    
    set({ trackCache: newCache });
  },
  
  // Selectors
  getTracksByFolder: (folderId = null) => {
    const { trackCache } = get();
    return trackCache.get(folderId) || [];
  },
  
  getError: () => {
    const { error } = get();
    return error;
  }
}));
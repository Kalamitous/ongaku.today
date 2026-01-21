import { useState } from "react";
import { createTrack as createTrackApi, updateTrack as updateTrackApi, deleteTrack as deleteTrackApi } from "@/lib/api/tracks";
import { createClient } from "@/lib/supabase/client";
import { useTrackStore } from "@/stores/track-store";
import { VALIDATION } from "@/constants/library";
import type { CreateTrackData } from "@/types/library.types";

export function useTrackActions() {
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Get actions from Zustand store
  const addTrack = useTrackStore((state) => state.addTrack);
  const updateTrack = useTrackStore((state) => state.updateTrack);
  const removeTrack = useTrackStore((state) => state.removeTrack);

  const createTrack = async (data: CreateTrackData) => {
    if (!data.url.trim()) {
      setActionError(VALIDATION.TRACK_URL_REQUIRED);
      return false;
    }

    // Import here to avoid circular dependency
    const { SourceUtils } = await import("@/utils/source-utils");
    const sourceData = SourceUtils.detectFromUrl(data.url.trim());
    
    if (!sourceData) {
      setActionError(VALIDATION.INVALID_URL);
      return false;
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Apply optimistic updates immediately
    const optimisticTrack = {
      id: `temp-${Date.now()}`, // Temporary ID
      source: sourceData.source,
      source_id: sourceData.id,
      title: data.title.trim() || `Track from ${SourceUtils.getSourceName(sourceData.source)}`,
      artist: data.artist?.trim() || null,
      folder_id: data.folder_id,
      user_id: user.id // Use actual authenticated user ID
    };

    // Update UI immediately with optimistic track
    addTrack(optimisticTrack);
    setActionError(null);

    // Create track in background
    const newTrack = await createTrackApi({
      url: data.url,
      source: sourceData.source,
      source_id: sourceData.id,
      title: data.title.trim() || `Track from ${SourceUtils.getSourceName(sourceData.source)}`,
      artist: data.artist?.trim() || undefined,
      folder_id: data.folder_id
    });
    
    // Replace optimistic track with real data
    removeTrack(optimisticTrack.id);
    addTrack(newTrack);
    
    return true;
  };

  return {
    actionError,
    createTrack
  };
}
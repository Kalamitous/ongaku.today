import type { Track, CreateTrackData } from "@/types/library.types";
import { createClient } from "@/lib/supabase/client";
import { calculateEndPosition, calculatePositionBetween } from "@/utils/position-utils";

export async function createTrack(data: CreateTrackData): Promise<Track> {
  const supabase = await createClient();
  console.log(data)
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Get position for new track (place at end)
  const position = await calculateEndPosition(
    'tracks',
    user.id,
    data.folder_id
  );

  // Insert track with user_id and position
  const { data: track, error } = await supabase
    .from('tracks')
    .insert([{
      ...data,
      position,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create track: ${error.message}`);
  }

  return track;
}

export async function getTracks(folderId: string | null): Promise<Track[]> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Fetch tracks for user and folder, ordered by position
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user.id)
    .eq('folder_id', folderId)
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tracks: ${error.message}`);
  }

  return tracks || [];
}

export async function getTrackById(id: string): Promise<Track | null> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: track, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch track: ${error.message}`);
  }

  return track;
}

export async function updateTrack(id: string, updates: Partial<Track>): Promise<Track> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: track, error } = await supabase
    .from('tracks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update track: ${error.message}`);
  }

  return track;
}

export async function deleteTrack(id: string): Promise<void> {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete track: ${error.message}`);
  }
}

export async function updateTrackPosition(id: string, position: string): Promise<Track> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  const { data: track, error } = await supabase
    .from('tracks')
    .update({ position })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update track position: ${error.message}`);
  return track;
}

export async function moveTrackToFolder(trackId: string, newFolderId: string | null, position?: string): Promise<Track> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  // If no position provided, place at end
  let finalPosition = position;
  if (!finalPosition) {
    finalPosition = await calculateEndPosition(
      'tracks',
      user.id,
      newFolderId
    );
  }

  const { data: track, error } = await supabase
    .from('tracks')
    .update({ 
      folder_id: newFolderId, 
      position: finalPosition
    })
    .eq('id', trackId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to move track: ${error.message}`);
  return track;
}
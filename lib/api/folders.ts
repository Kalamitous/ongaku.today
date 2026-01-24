import { createClient } from "@/lib/supabase/client";
import { getPositionBetween } from "@/utils/fractional-indexing";

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  position: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderData {
  name: string;
  parent_id?: string | null;
}

export interface UpdateFolderData {
  name?: string;
  parent_id?: string | null;
}

export async function createFolder(data: CreateFolderData): Promise<Folder> {
  const supabase = await createClient();
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Get existing folders to determine position
  let query = supabase
    .from('folders')
    .select('position')
    .eq('user_id', user.id);
  
  if (data.parent_id) {
    query = query.eq('parent_id', data.parent_id);
  } else {
    query = query.is('parent_id', null);
  }
  
  const { data: existingFolders, error: queryError } = await query.order('position', { ascending: true });

  if (queryError) {
    throw new Error(`Failed to fetch existing folders for position calculation: ${queryError.message}`);
  }

  // Calculate position at the end
  const position = getPositionBetween(
    existingFolders && existingFolders.length > 0 
      ? existingFolders[existingFolders.length - 1].position 
      : null,
    null
  );

  const { data: folder, error } = await supabase
    .from('folders')
    .insert([{
      ...data,
      user_id: user.id,
      position
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create folder: ${error.message}`);
  }

  return folder;
}

export async function getFolders(parentId?: string | null): Promise<Folder[]> {
  const supabase = await createClient();
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  
  let query = supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id);

  if (parentId && parentId !== "root") {
    query = query.eq('parent_id', parentId);
  } else {
    // Get root folders (where parent_id is null)
    query = query.is('parent_id', null);
  }

  const { data: folders, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch folders: ${error.message}`);
  }

  return folders || [];
}

export async function getFolderById(id: string): Promise<Folder | null> {
  const supabase = await createClient();
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  
  const { data: folder, error } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only access their own folders
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch folder: ${error.message}`);
  }

  return folder;
}

export async function updateFolder(id: string, data: UpdateFolderData): Promise<Folder> {
  const supabase = await createClient();
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  
  const { data: folder, error } = await supabase
    .from('folders')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own folders
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update folder: ${error.message}`);
  }

  return folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const supabase = await createClient();
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user can only delete their own folders

  if (error) {
    throw new Error(`Failed to delete folder: ${error.message}`);
  }
}

export async function getFolderTree(): Promise<Folder[]> {
  const supabase = await createClient();
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  
  const { data: folders, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id) // Only fetch folders belonging to current user
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch folder tree: ${error.message}`);
  }

  return folders || [];
}

export async function getFolderPath(folderId: string): Promise<Folder[]> {
  const supabase = await createClient();
  const path: Folder[] = [];
  
  let currentFolderId: string | null = folderId;
  
  while (currentFolderId !== null) {
    const folder = await getFolderById(currentFolderId);
    if (!folder) {
      break;
    }
    
    path.unshift(folder);
    currentFolderId = folder.parent_id;
  }
  
  return path;
}

export async function updateFolderPosition(id: string, position: string): Promise<Folder> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('folders')
    .update({ 
      position 
    })
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to update folder position: ${error.message}`);
  }

  return data;
}

export async function moveFolder(folderId: string, newParentId: string | null): Promise<Folder> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Fetch current folders in new parent to calculate position
  let query = supabase
    .from('folders')
    .select('position')
    .eq('user_id', user.id);
  
  if (newParentId) {
    query = query.eq('parent_id', newParentId);
  } else {
    query = query.is('parent_id', null);
  }

  const { data: existingFolders, error: queryError } = await query.order('position', { ascending: true });

  if (queryError) {
    throw new Error(`Failed to fetch existing folders for position calculation: ${queryError.message}`);
  }

  // Calculate position at the end of the new parent
  const position = getPositionBetween(
    existingFolders && existingFolders.length > 0 
      ? existingFolders[existingFolders.length - 1].position 
      : null,
    null
  );

  // Update both parent_id and position atomically
  const { data: folder, error } = await supabase
    .from('folders')
    .update({ 
      parent_id: newParentId,
      position 
    })
    .eq('id', folderId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to move folder: ${error.message}`);
  }

  return folder;
}
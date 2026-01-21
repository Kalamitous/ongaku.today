import { createClient } from "@/lib/supabase/client";
import { getInitialPositions } from "@/utils/fractional-indexing";

/**
 * One-time migration to populate NULL positions for existing folders
 * Run this once to fix existing data
 */
export async function migrateFolderPositions() {
  const supabase = await createClient();
  
  // Get all users (or you might want to run this per user)
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id');
    
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  for (const user of users) {
    // Get folders without positions for this user
    const { data: foldersWithoutPositions } = await supabase
      .from('folders')
      .select('id, parent_id')
      .eq('user_id', user.id)
      .is('position', 'null');

    if (!foldersWithoutPositions || foldersWithoutPositions.length === 0) {
      continue;
    }

    // Group by parent_id
    const foldersByParent = foldersWithoutPositions.reduce((acc, folder) => {
      const parentId = folder.parent_id || 'root';
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(folder);
      return acc;
    }, {} as Record<string, typeof foldersWithoutPositions>);

    // Update positions for each parent group
    for (const [parentId, folders] of Object.entries(foldersByParent)) {
      const positions = getInitialPositions(folders.length);
      
      for (let i = 0; i < folders.length; i++) {
        const { error } = await supabase
          .from('folders')
          .update({ position: positions[i] })
          .eq('id', folders[i].id);
          
        if (error) {
          console.error(`Error updating folder ${folders[i].id}:`, error);
        }
      }
    }
  }

  console.log('Folder position migration completed');
}
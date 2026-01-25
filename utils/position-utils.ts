import { getPositionBetween } from './fractional-indexing';
import { createClient } from '@/lib/supabase/client';

/**
 * Generic function to calculate position for new item at the end of a list
 */
export async function calculateEndPosition<T extends { position: string }>(
  tableName: 'folders' | 'tracks',
  userId: string,
  parentId: string | null,
  additionalFilters: Record<string, any> = {}
): Promise<string> {
  const supabase = await createClient();
  
  // Build query to get the last item
  let query = supabase
    .from(tableName)
    .select('position')
    .eq('user_id', userId);
  
  // Add parent filter
  if (parentId && tableName === 'folders') {
    query = query.eq('parent_id', parentId);
  } else if (parentId && tableName === 'tracks') {
    query = query.eq('folder_id', parentId);
  } else {
    // Root level items
    query = query.is(tableName === 'folders' ? 'parent_id' : 'folder_id', null);
  }
  
  // Add any additional filters
  Object.entries(additionalFilters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  // Get the last item by position
  const { data: lastItem } = await query
    .order('position', { ascending: false })
    .limit(1)
    .single();
  
  return getPositionBetween(lastItem?.position || null, null);
}

/**
 * Calculate position between two existing items
 */
export function calculatePositionBetween(
  prevPosition: string | null, 
  nextPosition: string | null
): string {
  return getPositionBetween(prevPosition, nextPosition);
}

/**
 * Batch calculate initial positions for a list of items
 */
export function calculateInitialPositions(count: number): string[] {
  const positions: string[] = [];
  let last = null;
  
  for (let i = 0; i < count; i++) {
    const position = getPositionBetween(last, null);
    positions.push(position);
    last = position;
  }
  
  return positions;
}
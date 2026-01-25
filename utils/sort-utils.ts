// Generic interface for items with position
export interface ItemWithPosition {
  position: string;
}

/**
 * Generic sort function for items with position using fractional indexing
 */
export const sortByPosition = <T extends ItemWithPosition>(items: T[]): T[] => 
  items.toSorted((a, b) => 
    a.position < b.position ? -1 : a.position > b.position ? 1 : 0
  );

// Legacy exports for backward compatibility
import type { Folder } from '@/lib/api/folders';
import type { Track } from '@/types/library.types';

/**
 * @deprecated Use sortByPosition instead
 */
export const sortFoldersByPosition = (folders: Folder[]): Folder[] => 
  sortByPosition(folders);

/**
 * @deprecated Use sortByPosition instead
 */
export const sortTracksByPosition = (tracks: Track[]): Track[] => 
  sortByPosition(tracks);

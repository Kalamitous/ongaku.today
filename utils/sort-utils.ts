import type { Folder } from '@/lib/api/folders';
import type { Track } from '@/types/library.types';

/**
 * Generic function to sort entities by position using fractional indexing
 */
export function sortByPosition<T extends { position: string }>(items: T[]): T[] {
  return items.toSorted((a, b) => 
    a.position < b.position ? -1 : a.position > b.position ? 1 : 0
  );
}

/**
 * Sort folders by position using fractional indexing
 */
export const sortFoldersByPosition = (folders: Folder[]): Folder[] => 
  sortByPosition(folders);

/**
 * Sort tracks by position using fractional indexing
 */
export const sortTracksByPosition = (tracks: Track[]): Track[] => 
  sortByPosition(tracks);

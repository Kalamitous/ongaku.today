import type { Folder } from '@/lib/api/folders';
import type { Track } from '@/types/library.types';

/**
 * Sort folders by position using fractional indexing
 */
export const sortFoldersByPosition = (folders: Folder[]): Folder[] => 
  folders.toSorted((a, b) => 
    a.position < b.position ? -1 : a.position > b.position ? 1 : 0
  );

/**
 * Sort tracks by position (if they have position field)
 */
export const sortTracksByPosition = (tracks: Track[]): Track[] => 
  tracks.toSorted((a, b) => {
    // For tracks, we might need to sort by position or by creation date
    // Adjust this based on how tracks are ordered
    return 0; // Placeholder - implement based on actual track sorting needs
  });
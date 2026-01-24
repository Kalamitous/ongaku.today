import type { Folder } from '@/lib/api/folders';
import type { Track } from '@/types/library.types';

export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  list: (parentId: string | null) => 
    [...folderKeys.lists(), parentId] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => 
    [...folderKeys.details(), id] as const,
  paths: () => [...folderKeys.all, 'path'] as const,
  path: (id: string) => 
    [...folderKeys.paths(), id] as const,
} as const;

export const trackKeys = {
  all: ['tracks'] as const,
  lists: () => [...trackKeys.all, 'list'] as const,
  list: (folderId: string | null) => 
    [...trackKeys.lists(), folderId] as const,
  details: () => [...trackKeys.all, 'detail'] as const,
  detail: (id: string) => 
    [...trackKeys.details(), id] as const,
} as const;

export type FolderQueryKey = typeof folderKeys;
export type TrackQueryKey = typeof trackKeys;

export interface LibraryBreadcrumbItem {
  id: string;
  name: string;
}

// Re-export Folder from API for convenience
export type { Folder } from "@/lib/api/folders";

// Component Props Types
export interface NavigationBarProps {
  path: LibraryBreadcrumbItem[];
  onNavigateToBreadcrumb: (index: number) => void;
  onUpdateFolder: (folderId: string, folderName: string, selectedParentId: string | null) => void;
  onDelete: (folderId: string) => void;
}

export interface ActionsBarProps {
  onCreateFolder: (folderName: string) => void;
  onAddTrack?: (data: CreateTrackData) => void;
  onDeleteFolder?: (folderId: string) => void;
  currentFolderId?: string;
}

export interface ExplorerProps {
  allFolders: import("@/lib/api/folders").Folder[];
  selectedParentId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onNavigate: (folderId: string, folderName?: string) => void;
  loading?: boolean;
}

export interface FolderItemProps {
  folder: import("@/lib/api/folders").Folder;
  isSelected?: boolean;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

// Track types
export enum Source {
  YOUTUBE = 1,
  SOUNDCLOUD = 2
}

export interface Track {
  id: string;
  source: Source;
  source_id: string;
  title: string;
  artist: string | null;
  folder_id: string;
  user_id: string;
}

export interface CreateTrackData {
  url: string;
  source: Source;
  source_id: string;
  title: string;
  artist?: string;
  folder_id: string;
}

export interface AddTrackDialogProps {
  onConfirm: (data: CreateTrackData) => void;
  folderId: string;
  triggerButton?: React.ReactNode;
}

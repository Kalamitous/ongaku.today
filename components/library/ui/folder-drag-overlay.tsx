import { Folder } from '@/lib/api/folders';
import { DragOverlay } from './drag-overlay';
import { Folder as FolderIcon } from "lucide-react";

interface FolderDragOverlayProps {
  folder: Folder | null;
}

export function FolderDragOverlay({ folder }: FolderDragOverlayProps) {
  if (!folder) return null;

  return (
    <DragOverlay
      icon={FolderIcon}
      iconClassName="text-blue-500"
      title={folder.name}
      showChevron={true}
    />
  );
}
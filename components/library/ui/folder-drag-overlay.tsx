import { FolderItem } from './folder-item';
import { Folder } from '@/lib/api/folders';

interface FolderDragOverlayProps {
  folder: Folder | null;
}

export function FolderDragOverlay({ folder }: FolderDragOverlayProps) {
  if (!folder) return null;

  return (
    <div className="folder-drag-overlay">
      <FolderItem
        folder={folder}
        isSelected={false}
        onClick={() => {}}
        onContextMenu={() => {}}
      />
    </div>
  );
}
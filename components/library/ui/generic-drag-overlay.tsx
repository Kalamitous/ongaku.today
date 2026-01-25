import React from "react";
import { DragOverlay } from './drag-overlay';
import { LucideIcon } from "lucide-react";

interface GenericDragOverlayProps<T> {
  item: T | null;
  icon: LucideIcon;
  iconClassName?: string;
  subtitle?: string;
  showChevron?: boolean;
  getTitle: (item: T) => string;
}

/**
 * Generic drag overlay component that works for both tracks and folders
 * Eliminates duplication between TrackDragOverlay and FolderDragOverlay
 */
export function GenericDragOverlay<T>({ 
  item, 
  icon: Icon, 
  iconClassName, 
  subtitle, 
  showChevron = false,
  getTitle
}: GenericDragOverlayProps<T>) {
  if (!item) return null;

  return (
    <DragOverlay
      icon={Icon}
      iconClassName={iconClassName}
      title={getTitle(item)}
      subtitle={subtitle}
      showChevron={showChevron}
    />
  );
}
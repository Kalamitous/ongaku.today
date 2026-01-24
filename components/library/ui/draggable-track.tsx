"use client";

import { TrackItem } from './track-item';
import { SortableItem } from './sortable-item';
import type { Track } from '@/types/library.types';

interface DraggableTrackProps {
  track: Track;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function DraggableTrack({ track, onClick, onContextMenu }: DraggableTrackProps) {
  const handleClick = () => {
    onClick?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu?.(e);
  };

  return (
    <SortableItem id={`track-${track.id}`} isDragging={false}>
      <TrackItem
        track={track}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
    </SortableItem>
  );
}

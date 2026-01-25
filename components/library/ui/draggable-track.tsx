"use client";

import { TrackItem } from './track-item';
import { DraggableItem } from './draggable-item';
import type { Track } from '@/types/library.types';

interface DraggableTrackProps {
  track: Track;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function DraggableTrack({ track, onClick, onContextMenu }: DraggableTrackProps) {
  return (
    <DraggableItem 
      item={track} 
      render={(trackItem, props) => (
        <TrackItem
          track={trackItem}
          onClick={props.onClick}
          onContextMenu={props.onContextMenu}
        />
      )}
      onClick={onClick}
      onContextMenu={(e, itemId) => onContextMenu?.(e)}
      idPrefix="track-"
    />
  );
}

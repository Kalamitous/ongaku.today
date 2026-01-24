"use client";

import type { Track } from '@/types/library.types';
import { DragOverlay } from './drag-overlay';
import { Music } from "lucide-react";

interface TrackDragOverlayProps {
  track: Track;
}

export function TrackDragOverlay({ track }: TrackDragOverlayProps) {
  return (
    <DragOverlay
      icon={Music}
      title={track.title}
      subtitle={track.artist || undefined}
    />
  );
}
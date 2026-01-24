"use client";

import { Music } from "lucide-react";
import { ListItem } from './list-item';
import type { Track } from '@/types/library.types';

interface TrackItemProps {
  track: Track;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}

export function TrackItem({ track, onClick, onContextMenu, isSelected }: TrackItemProps) {
  return (
    <ListItem
      icon={Music}
      title={track.title}
      subtitle={track.artist || undefined}
      onClick={onClick}
      onContextMenu={onContextMenu}
      isSelected={isSelected}
    />
  );
}
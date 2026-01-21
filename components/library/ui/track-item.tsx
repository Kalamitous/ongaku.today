"use client";

import React from "react";
import { Music as MusicIcon } from "lucide-react";

// Define Track interface locally to avoid import issues
interface Track {
  id: string;
  source: any; // Using any for now to avoid type issues
  source_id: string;
  title: string;
  artist: string | null;
  folder_id: string;
  user_id: string;
}

interface TrackItemProps {
  track: Track;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

export function TrackItem({ track, onClick, onContextMenu }: TrackItemProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-accent transition-colors"
      onClick={() => onClick()}
      onContextMenu={(e) => onContextMenu(e, track.id)}
    >
      <MusicIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{track.title}</div>
        {track.artist && (
          <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SourceUtils } from "@/utils/source-utils";
import { VALIDATION } from "@/constants/library";
import type { AddTrackDialogProps } from "@/types/library.types";

export function AddTrackDialog({
  onConfirm,
  folderId,
  triggerButton
}: AddTrackDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    
    // Debug logging
    console.log('handleConfirm called with url:', JSON.stringify(url));
    console.log('url.trim() result:', JSON.stringify(url.trim()));
    console.log('!url.trim() result:', !url.trim());
    
    const urlToProcess = url.trim();
    
    if (!urlToProcess) {
      setError(VALIDATION.TRACK_URL_REQUIRED);
      return;
    }

    const sourceData = SourceUtils.detectFromUrl(urlToProcess);
    if (!sourceData) {
      setError(VALIDATION.INVALID_URL);
      return;
    }

    // Proceed if we have valid source data
    if (sourceData) {
      // Capture URL before resetting form
      const finalUrl = urlToProcess;
      const finalTitle = title.trim() || `Track from ${SourceUtils.getSourceName(sourceData.source)}`;
      const finalArtist = artist.trim() || undefined;
      
      setDialogOpen(false);
      onConfirm({
        url: finalUrl, // Include the URL too
        source: sourceData.source,
        source_id: sourceData.id,
        title: finalTitle || `Track from ${SourceUtils.getSourceName(sourceData.source)}`,
        artist: finalArtist,
        folder_id: folderId
      });
      
      // Reset form AFTER confirming
      setUrl("");
      setTitle("");
      setArtist("");
      setError(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setUrl("");
      setTitle("");
      setArtist("");
      setError(null);
    }
    setDialogOpen(open);
  };

  // Auto-detect source for display
  const sourceData = url.trim() ? SourceUtils.detectFromUrl(url.trim()) : null;
  const sourceName = sourceData ? SourceUtils.getSourceName(sourceData.source) : "";

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>Add Track</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Track</DialogTitle>
          <DialogDescription>
            Add a YouTube or SoundCloud track to your library.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="Enter YouTube or SoundCloud URL"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              autoFocus
            />
            {sourceName && (
              <p className="text-xs text-muted-foreground">
                Detected: {sourceName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Track title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist (Optional)</Label>
              <Input
                id="artist"
                placeholder="Artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={!url.trim()}>
            Add Track
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
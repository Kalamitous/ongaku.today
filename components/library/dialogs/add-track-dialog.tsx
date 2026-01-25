"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenericDialog } from "@/components/ui/generic-dialog";
import { SourceUtils } from "@/utils/source-utils";
import { VALIDATION } from "@/constants/library";
import { useDialogState } from "@/hooks/use-dialog-state";
import type { AddTrackDialogProps } from "@/types/library.types";

interface TrackFormState {
  url: string;
  title: string;
  artist: string;
  error: string | null;
}

export function AddTrackDialog({
  onConfirm,
  folderId,
  triggerButton
}: AddTrackDialogProps) {
  const {
    isOpen,
    value: formData,
    setValue: setFormData,
    handleOpenChange,
    close
  } = useDialogState<TrackFormState>({
    initialValue: { url: "", title: "", artist: "", error: null },
    customResetLogic: () => ({ url: "", title: "", artist: "", error: null })
  });

  const updateField = (field: keyof TrackFormState) => (value: string | null) => {
    setFormData({ ...formData, [field]: value, error: field === 'url' ? null : formData.error });
  };

  const handleConfirm = () => {
    const urlToProcess = formData.url.trim();
    
    if (!urlToProcess) {
      setFormData({ ...formData, error: VALIDATION.TRACK_URL_REQUIRED });
      return;
    }

    const sourceData = SourceUtils.detectFromUrl(urlToProcess);
    if (!sourceData) {
      setFormData({ ...formData, error: VALIDATION.INVALID_URL });
      return;
    }

    const finalTitle = formData.title.trim() || `Track from ${SourceUtils.getSourceName(sourceData.source)}`;
    const finalArtist = formData.artist.trim() || undefined;
    
    close();
    onConfirm({
      source: sourceData.source,
      source_id: sourceData.id,
      title: finalTitle,
      artist: finalArtist,
      folder_id: folderId
    });
  };

  const sourceData = formData.url.trim() ? SourceUtils.detectFromUrl(formData.url.trim()) : null;
  const sourceName = sourceData ? SourceUtils.getSourceName(sourceData.source) : "";

  return (
    <GenericDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="Add Track"
      description="Add a YouTube or SoundCloud track to your library."
      triggerButton={triggerButton || <Button>Add Track</Button>}
      confirmText="Add Track"
      onConfirm={handleConfirm}
      confirmDisabled={!formData.url.trim()}
    >
      {formData.error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {formData.error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          placeholder="Enter YouTube or SoundCloud URL"
          value={formData.url}
          onChange={(e) => updateField('url')(e.target.value)}
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
            value={formData.title}
            onChange={(e) => updateField('title')(e.target.value)}
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
            value={formData.artist}
            onChange={(e) => updateField('artist')(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirm();
              }
            }}
          />
        </div>
      </div>
    </GenericDialog>
  );
}
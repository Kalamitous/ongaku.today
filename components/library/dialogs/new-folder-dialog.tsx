"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericDialog } from "@/components/ui/generic-dialog";
import { useDialogState } from "@/hooks/use-dialog-state";

interface NewFolderDialogProps {
  onConfirm: (folderName: string) => void;
  error?: string | null;
  triggerButton?: React.ReactNode;
}

export function NewFolderDialog({
  onConfirm,
  error,
  triggerButton
}: NewFolderDialogProps) {
  const {
    isOpen,
    value: folderName,
    setValue: setFolderName,
    handleOpenChange,
    close
  } = useDialogState({
    initialValue: "",
    customResetLogic: () => ""
  });

  const handleConfirm = () => {
    if (folderName.trim()) {
      onConfirm(folderName);
      close();
    }
  };

  return (
    <GenericDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="Create New Folder"
      description="Enter a name for your new folder."
      triggerButton={triggerButton || <Button>New Folder</Button>}
      confirmText="Create"
      onConfirm={handleConfirm}
      confirmDisabled={!folderName.trim()}
    >
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <Input
        placeholder="Enter folder name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleConfirm();
          }
        }}
        autoFocus
      />
    </GenericDialog>
  );
}
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [folderName, setFolderName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConfirm = () => {
    if (folderName.trim()) {
      onConfirm(folderName);
      setFolderName("");
      setDialogOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFolderName("");
    }
    setDialogOpen(open);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>New Folder</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setFolderName("")}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={!folderName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
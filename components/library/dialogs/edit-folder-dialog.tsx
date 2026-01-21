"use client";

import React, { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLibraryNavigation } from "@/hooks/use-library-navigation";
import { useFolderData } from "@/hooks/use-folder-data";
import { useFolderStore } from "@/stores/folder-store";
import { Explorer } from "../ui/explorer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROOT_FOLDER } from "@/constants/library";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Folder } from "@/types/library.types";

interface EditFolderDialogProps {
  folderId: string;
  currentName: string;
  explorerPath?: { id: string; name: string }[];
  onUpdate: (folderId: string, folderName: string, selectedParentId: string | null) => void;
  onDelete?: (folderId: string) => void;
  error?: string | null;
  triggerButton?: React.ReactNode;
}

export function EditFolderDialog({
  folderId,
  currentName,
  explorerPath = [ROOT_FOLDER],
  onUpdate,
  onDelete,
  error,
  triggerButton
}: EditFolderDialogProps) {
  const [editFolderName, setEditFolderName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Get folder cache data
  const folderCache = useFolderStore((state) => state.folderCache);
  const allCachedFolders = Array.from(folderCache.values()).flat();
  
  // Load data for the selected parent level to ensure children are loaded
  const { folders: loadedFolders, loading } = useFolderData(selectedParentId);
  
  // Get folders at the selected parent level from cache (includes loaded + cached)
  const foldersAtSelectedLevel = allCachedFolders.filter((f: Folder) => 
    f.parent_id === selectedParentId && f.id !== folderId
  );
  
  // Get the breadcrumb path for the selected parent
  const getBreadcrumbPath = () => {
    if (!selectedParentId) {
      return [ROOT_FOLDER];
    }
    
    // Find the path to the selected parent from the main explorer path
    const parentIndex = explorerPath.findIndex(item => item.id === selectedParentId);
    if (parentIndex !== -1) {
      return explorerPath.slice(0, parentIndex + 1);
    }
    
    // Fallback: construct path from cache
    const path: { id: string; name: string }[] = [ROOT_FOLDER];
    const parentFolder = allCachedFolders.find(f => f.id === selectedParentId);
    if (parentFolder) {
      path.push({ id: parentFolder.id, name: parentFolder.name });
    }
    
    return path;
  };
  
  const breadcrumbPath = getBreadcrumbPath();
  
  // Navigation functions for breadcrumbs
  const navigateToBreadcrumb = (targetId: string | null) => {
    setSelectedParentId(targetId);
  };
  
  // Helper to get folder name from cache
  const getFolderName = (folderId: string | null) => {
    if (folderId === null) return ROOT_FOLDER.name;
    const folder = allCachedFolders.find(f => f.id === folderId);
    return folder?.name || "Unknown";
  };

  // Get the actual parent ID of the folder being edited
  const getActualParentId = () => {
    const folder = allCachedFolders.find(f => f.id === folderId);
    return folder?.parent_id || null;
  };

  useEffect(() => {
    setEditFolderName(currentName);
    // Use the actual parent ID of the folder being edited, not the current explorer location
    setSelectedParentId(getActualParentId());
  }, [dialogOpen, currentName, folderId]);

  const handleUpdate = () => {
    if (editFolderName.trim()) {
      setDialogOpen(false);
      onUpdate(folderId, editFolderName.trim(), selectedParentId);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditFolderName("");
      setSelectedParentId(null);
    }
    setDialogOpen(open);
  };

  const handleDelete = () => {
    if (onDelete) {
      setDialogOpen(false);
      onDelete(folderId);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
          <DialogDescription>
            Update the folder name and location.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Enter name"
              value={editFolderName}
              onChange={(e) => setEditFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate();
                }
              }}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Parent folder</label>
            <div className="border rounded-md">
              <div className="p-2 border-b">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbPath.map((item, index) => (
                      <React.Fragment key={`breadcrumb-${item.id}`}>
                        <BreadcrumbItem>
                          {index === breadcrumbPath.length - 1 ? (
                            <BreadcrumbPage>{item.name}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              onClick={() => {
                                navigateToBreadcrumb(item.id === "root" ? null : item.id);
                              }}
                              className="cursor-pointer"
                            >
                              {item.name}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbPath.length - 1 && (
                          <BreadcrumbSeparator />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <ScrollArea className="h-48">
                <div className="p-2">
                  <Explorer 
                    allFolders={foldersAtSelectedLevel}
                    currentParentId={selectedParentId}
                    selectedParentId={selectedParentId}
                    onSelectFolder={setSelectedParentId}
                    loading={loading}
                    onNavigate={(folderId, folderName) => {
                      setSelectedParentId(folderId);
                    }}
                  />
                </div>
              </ScrollArea>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {getFolderName(selectedParentId)}
            </p>
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={!onDelete}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Folder</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{currentName}&quot;? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" onClick={() => {
                  setEditFolderName("");
                  setSelectedParentId(null);
                }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleUpdate} disabled={!editFolderName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
      

    </Dialog>
  );
}
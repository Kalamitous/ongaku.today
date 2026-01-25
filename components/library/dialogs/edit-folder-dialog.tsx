"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericDialog } from "@/components/ui/generic-dialog";
import { useDialogState } from "@/hooks/use-dialog-state";
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
import { useFolders } from "@/hooks/queries/use-folders";
import { useFolder } from "@/hooks/queries/use-folder";
import { useAllFoldersFromCache } from "@/hooks/queries/use-all-folders-from-cache";
import { useLibraryNavigation } from "@/hooks/use-library-navigation";
import { folderUtils } from "@/utils/folder-utils";
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
  onUpdate: (folderId: string, folderName: string, selectedParentId: string | null) => void;
  onDelete?: (folderId: string) => void;
  error?: string | null;
  triggerButton?: React.ReactNode;
}

interface EditFolderState {
  folderName: string;
}

export function EditFolderDialog({
  folderId,
  currentName,
  onUpdate,
  onDelete,
  error,
  triggerButton
}: EditFolderDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    value: editState,
    setValue: setEditState,
    reset
  } = useDialogState<EditFolderState>({
    initialValue: { folderName: currentName },
    customResetLogic: () => ({ folderName: currentName })
  });
  
  const allFolders = useAllFoldersFromCache();
  
  const initialPath = useMemo(() => {
    const currentFolder = allFolders.find(f => f.id === folderId);
    const parentId = currentFolder?.parent_id || null;
    return parentId ? folderUtils.buildPathFromFolders(allFolders, parentId) : [ROOT_FOLDER];
  }, [allFolders, folderId]);
  
  const { currentPath, setCurrentPath, getCurrentParentId, navigateTo, navigateToBreadcrumb } = useLibraryNavigation(initialPath);
  
  const selectedParentId = getCurrentParentId();
  const { data: folders = [], isLoading } = useFolders(selectedParentId);
  const { data: selectedFolder } = useFolder(selectedParentId);
  
  const foldersAtSelectedLevel = folders.filter((folder: Folder) => 
    folder.id !== folderId
  );
  
  useEffect(() => {
    if (dialogOpen) {
      setEditState({ folderName: currentName });
    }
  }, [dialogOpen, currentName, setEditState]);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      reset();
      setCurrentPath(initialPath);
    }
  };

  const handleUpdate = () => {
    if (editState.folderName.trim()) {
      setDialogOpen(false);
      onUpdate(folderId, editState.folderName.trim(), selectedParentId);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      setDialogOpen(false);
      onDelete(folderId);
    }
  };

  const deleteButton = onDelete ? (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
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
  ) : null;

  return (
    <GenericDialog
      isOpen={dialogOpen}
      onOpenChange={handleOpenChange}
      title="Edit Folder"
      description="Update the folder name and location."
      triggerButton={triggerButton || (
        <Button variant="ghost" size="sm">Edit</Button>
      )}
      confirmText="Save"
      onConfirm={handleUpdate}
      confirmDisabled={!editState.folderName.trim()}
      footerExtra={deleteButton}
    >
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          placeholder="Enter name"
          value={editState.folderName}
          onChange={(e) => setEditState({ ...editState, folderName: e.target.value })}
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
                {currentPath.map((item, index) => (
                  <React.Fragment key={`breadcrumb-${item.id}`}>
                    <BreadcrumbItem>
                      {index === currentPath.length - 1 ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          onClick={() => {
                            navigateToBreadcrumb(index);
                          }}
                          className="cursor-pointer"
                        >
                          {item.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < currentPath.length - 1 && (
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
                selectedParentId={selectedParentId}
                onSelectFolder={() => {
                  // Selection only - no navigation needed in edit dialog
                }}
                loading={isLoading}
                onNavigate={(folderId) => {
                  if (!folderId) return;
                  const targetIndex = currentPath.findIndex(item => item.id === folderId);
                  if (targetIndex !== -1) {
                    navigateToBreadcrumb(targetIndex);
                  } else {
                    const selectedFolder = allFolders.find(folder => folder.id === folderId);
                    if (selectedFolder) {
                      navigateTo(folderId, selectedFolder.name);
                    }
                  }
                }}
              />
            </div>
          </ScrollArea>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Selected: {selectedFolder?.name || ROOT_FOLDER.name}
        </p>
      </div>
    </GenericDialog>
  );
}
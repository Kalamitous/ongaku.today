"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { EditFolderDialog } from "../dialogs/edit-folder-dialog";
import { useFolder } from "@/hooks/queries/use-folder";
import type { NavigationBarProps } from "@/types/library.types";

export function NavigationBar({ path, onNavigateToBreadcrumb, onUpdateFolder, onDelete }: NavigationBarProps) {
  // Show Edit button only when not at root
  const currentFolder = path[path.length - 1];
  const showEditButton = currentFolder && currentFolder.id !== "root";
  
  // Get full folder data to access parent_id
  const { data: fullFolderData } = useFolder(currentFolder?.id || null);
  const actualParentId = fullFolderData?.parent_id || null;

  return (
    <div className="flex items-center gap-2 pb-2 border-b">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <Breadcrumb>
          <BreadcrumbList>
            {path.map((item, index) => (
              <React.Fragment key={`breadcrumb-${item.id}`}>
                <BreadcrumbItem>
                  {index === path.length - 1 ? (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => onNavigateToBreadcrumb(index)}
                      className="cursor-pointer"
                    >
                      {item.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < path.length - 1 && (
                  <BreadcrumbSeparator />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Edit Folder Button - only show when not at root */}
      {showEditButton && currentFolder && (
          <EditFolderDialog
            folderId={currentFolder.id}
            currentName={currentFolder.name}
            initialParentId={actualParentId}
            onUpdate={onUpdateFolder}
            onDelete={onDelete}
            triggerButton={
            <Button
              key="edit-folder"
              variant="ghost"
              size="sm"
              className="px-2 py-1 h-8"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          }
        />
      )}
    </div>
  );
}
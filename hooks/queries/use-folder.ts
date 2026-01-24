"use client";

import { useQuery } from "@tanstack/react-query";
import { getFolderById } from "@/lib/api/folders";
import { folderKeys } from "@/lib/tanstack-query/keys";

export function useFolder(folderId: string | null) {
  return useQuery({
    queryKey: folderKeys.detail(folderId!),
    queryFn: () => getFolderById(folderId!),
    enabled: !!folderId && folderId !== "root",
  });
}
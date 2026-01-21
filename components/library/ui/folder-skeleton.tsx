import { Skeleton } from "@/components/ui/skeleton"

interface FolderSkeletonProps {
  nameWidth?: string;
}

export function FolderSkeleton({ nameWidth = "w-full" }: FolderSkeletonProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded">
      <Skeleton className="h-5 w-5" />
      <div className="flex-1 min-w-0">
        <Skeleton className={`h-4 ${nameWidth}`} />
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

export function FolderSkeletonList() {
  const nameWidths = ["w-[70%]", "w-[85%]", "w-[60%]", "w-[90%]"];
  
  return (
    <div className="space-y-1">
      {nameWidths.map((width, index) => (
        <FolderSkeleton key={index} nameWidth={width} />
      ))}
    </div>
  );
}
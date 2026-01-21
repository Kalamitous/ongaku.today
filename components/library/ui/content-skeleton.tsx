"use client";

import { Skeleton } from "@/components/ui/skeleton"

export function ContentSkeleton() {
  const widths = ["w-[70%]", "w-[85%]", "w-[60%]", "w-[90%]"];
  
  return (
    <div className="space-y-1">
      {widths.map((width, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2 rounded">
          <Skeleton className="h-5 w-5" />
          <div className="flex-1 min-w-0">
            <Skeleton className={`h-4 ${width}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
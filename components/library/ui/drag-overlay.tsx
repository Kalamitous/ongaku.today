"use client";

import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragOverlayProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  showChevron?: boolean;
}

export function DragOverlay({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  showChevron = false
}: DragOverlayProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-background shadow-lg rounded-md ring-1 ring-primary ring-offset-1">
      <Icon className={cn("h-4 w-4", iconClassName)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
      {showChevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}
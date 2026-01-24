"use client";

import React from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListItemProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  showChevron?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  isSelected?: boolean;
}

export function ListItem({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  showChevron = false,
  onClick,
  onContextMenu,
  className,
  isSelected = false
}: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
        isSelected && "bg-accent",
        className
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", iconClassName)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
      {showChevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  );
}
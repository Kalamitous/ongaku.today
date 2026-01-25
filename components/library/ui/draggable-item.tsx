"use client";

import { SortableItem } from './sortable-item';
import { ReactNode } from 'react';

interface DraggableItemProps<T extends { id: string }> {
  item: T;
  render: (item: T, props: {
    onClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    isSelected: boolean;
  }) => ReactNode;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent, itemId: string) => void;
  isSelected?: boolean;
  idPrefix?: string;
}

export function DraggableItem<T extends { id: string }>({ 
  item, 
  render, 
  onClick, 
  onContextMenu, 
  isSelected = false,
  idPrefix = ''
}: DraggableItemProps<T>) {
  const handleClick = () => {
    onClick?.();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    onContextMenu?.(e, item.id);
  };

  return (
    <SortableItem id={`${idPrefix}${item.id}`} isDragging={false}>
      {render(item, {
        onClick: handleClick,
        onContextMenu: handleContextMenu,
        isSelected
      })}
    </SortableItem>
  );
}
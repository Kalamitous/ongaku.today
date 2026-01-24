# Track DND and Cross-Entity Dragging Implementation Plan

## Problem Statement

The ongaku.today library currently has **sophisticated folder drag-and-drop** with fractional indexing, virtualization, and optimistic updates. However, **tracks cannot be dragged at all** - they lack position fields, DND components, and the ability to be reordered within folders or moved between folders.

**Goal**: Implement full track DND functionality that matches the quality of the existing folder DND system, with seamless cross-entity dragging (tracks can be dragged to folders and vice versa).

---

## Current State Analysis

### ✅ **What Already Exists (High Quality)**

#### **Core Infrastructure**
- **@dnd-kit**: Complete setup with `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, `@dnd-kit/utilities`
- **Fractional Indexing**: `utils/fractional-indexing.ts` with base-95 encoding
- **Virtualization**: `@tanstack/react-virtual` for performance at scale
- **TanStack Query**: Optimistic mutations, cache management, error handling

#### **Folder Implementation (Reference Quality)**
- **Data Layer**: `lib/api/folders.ts` with position functions (`updateFolderPosition`, `moveFolder`)
- **Mutations**: `hooks/mutations/use-reorder-folders.ts` with optimistic updates
- **UI Components**: 
  - `draggable-folder.tsx` (sortable folder item)
  - `folder-drag-overlay.tsx` (visual feedback)
  - `virtualized-sortable-list.tsx` (virtualized DND list)
- **Types**: Folder interface includes `position: string` field
- **Sorting**: `utils/sort-utils.ts` with `sortFoldersByPosition()`

#### **Query Infrastructure**
- **Cache Keys**: `lib/tanstack-query/keys.ts` with proper folder scoping
- **Hooks**: `hooks/queries/use-folders.ts`, `hooks/queries/use-all-folders-from-cache.ts`

### 🚫 **What's Missing for Tracks**

#### **Data Layer**
```typescript
// Current Track interface (MISSING POSITION)
export interface Track {
  id: string;
  source: Source;
  source_id: string;
  title: string;
  artist: string | null;
  folder_id: string;  // Relationship to folders
  user_id: string;
  // MISSING: position: string;
}
```

#### **API Functions** (Completely Missing)
- `updateTrackPosition(id, position)`
- Position-aware `getTracks()` (currently no ordering)
- Position-aware `createTrack()` (assigns position on creation)

#### **Components** (Non-existent)
- `draggable-track.tsx`
- `track-drag-overlay.tsx`
- Track-specific virtualized list

#### **Mutations** (Non-existent)
- `use-reorder-tracks.ts`
- Cross-entity mutations

---

## Implementation Plan

## Phase 1: Foundation - Track Position Infrastructure

### 1.1 Database Schema Update
```sql
-- Run this migration to add position to tracks
ALTER TABLE tracks ADD COLUMN position TEXT;

-- Populate existing tracks with initial positions
UPDATE tracks 
SET position = generate_key_between(NULL, NULL, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+,-./:;<=>?@[]^_`{|}~')
WHERE position IS NULL;

-- Create index for performance
CREATE INDEX idx_tracks_position ON tracks(folder_id, position);
```

### 1.2 Type System Updates
```typescript
// types/library.types.ts
export interface Track {
  id: string;
  source: Source;
  source_id: string;
  title: string;
  artist: string | null;
  folder_id: string;
  user_id: string;
  position: string;  // ADD THIS
  created_at: string;
  updated_at: string;
}
```

### 1.3 API Layer Extensions
```typescript
// lib/api/tracks.ts - Add these functions

// Get existing functions and modify:
export async function getTracks(folderId: string | null): Promise<Track[]> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', user.id)
    .eq('folder_id', folderId)
    .order('position', { ascending: true }); // ADD ORDERING

  if (error) throw new Error(`Failed to fetch tracks: ${error.message}`);
  return tracks || [];
}

// Add new functions:
export async function updateTrackPosition(id: string, position: string): Promise<Track> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  const { data: track, error } = await supabase
    .from('tracks')
    .update({ position, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update track position: ${error.message}`);
  return track;
}

export async function moveTrackToFolder(trackId: string, newFolderId: string | null, position?: string): Promise<Track> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  // If no position provided, place at end
  let finalPosition = position;
  if (!finalPosition) {
    const { data: lastTrack } = await supabase
      .from('tracks')
      .select('position')
      .eq('user_id', user.id)
      .eq('folder_id', newFolderId)
      .order('position', { ascending: false })
      .limit(1)
      .single();
    
    finalPosition = getPositionBetween(lastTrack?.position || null, null);
  }

  const { data: track, error } = await supabase
    .from('tracks')
    .update({ 
      folder_id: newFolderId, 
      position: finalPosition,
      updated_at: new Date().toISOString() 
    })
    .eq('id', trackId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to move track: ${error.message}`);
  return track;
}

// Modify createTrack to assign position:
export async function createTrack(data: CreateTrackData): Promise<Track> {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  // Get position for new track (place at end)
  const { data: lastTrack } = await supabase
    .from('tracks')
    .select('position')
    .eq('user_id', user.id)
    .eq('folder_id', data.folder_id)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const position = getPositionBetween(lastTrack?.position || null, null);

  const { data: track, error } = await supabase
    .from('tracks')
    .insert([{
      ...data,
      position, // ADD POSITION
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create track: ${error.message}`);
  return track;
}
```

### 1.4 Query Infrastructure Updates
```typescript
// lib/tanstack-query/keys.ts - Add track keys
export const trackKeys = {
  all: ['tracks'] as const,
  lists: () => [...trackKeys.all, 'list'] as const,
  list: (folderId: string | null) => [...trackKeys.lists(), folderId] as const,
  details: () => [...trackKeys.all, 'detail'] as const,
  detail: (id: string) => [...trackKeys.details(), id] as const,
};

// hooks/queries/use-tracks.ts - Update to sort by position
export function useTracks(folderId: string | null) {
  return useQuery({
    queryKey: trackKeys.list(folderId),
    queryFn: () => getTracks(folderId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

## Phase 2: Track DND Components

### 2.1 Track Components

#### `components/library/ui/draggable-track.tsx`
```typescript
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Track } from '@/lib/api/tracks';
import { TrackItem } from './track-item';

interface DraggableTrackProps {
  track: Track;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function DraggableTrack({ track, onClick, onContextMenu }: DraggableTrackProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `track-${track.id}` }); // Prefix to avoid ID conflicts

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TrackItem
        track={track}
        onClick={onClick}
        onContextMenu={onContextMenu}
      />
    </div>
  );
}
```

#### `components/library/ui/track-drag-overlay.tsx`
```typescript
import { Track } from '@/lib/api/tracks';
import { Music } from 'lucide-react';

interface TrackDragOverlayProps {
  track: Track;
}

export function TrackDragOverlay({ track }: TrackDragOverlayProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background border-2 border-primary rounded-md shadow-lg">
      <Music className="h-4 w-4 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{track.title}</p>
        {track.artist && (
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        )}
      </div>
    </div>
  );
}
```

#### Update `components/library/ui/track-item.tsx`
```typescript
import { Track } from '@/lib/api/tracks';
import { Music } from 'lucide-react';

interface TrackItemProps {
  track: Track;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function TrackItem({ track, onClick, onContextMenu }: TrackItemProps) {
  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-accent rounded-md cursor-pointer transition-colors"
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{track.title}</p>
        {track.artist && (
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
        )}
      </div>
    </div>
  );
}
```

### 2.2 Track Mutation Hooks

#### `hooks/mutations/use-reorder-tracks.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackKeys } from '@/lib/tanstack-query/keys';
import { updateTrackPosition as updateTrackPositionApi } from '@/lib/api/tracks';
import { getPositionBetween } from '@/utils/fractional-indexing';
import type { Track } from '@/lib/api/tracks';

export function useReorderTracks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      folderId,
      oldIndex, 
      newIndex 
    }: { 
      folderId: string | null; 
      oldIndex: number; 
      newIndex: number 
    }) => {
      const currentData = queryClient.getQueryData<Track[]>(
        trackKeys.list(folderId)
      );
      
      if (!currentData) throw new Error('No track data found');
      
      const sortedTracks = [...currentData].sort((a, b) => a.position.localeCompare(b.position));
      const movedTrack = sortedTracks[newIndex];
      
      await updateTrackPositionApi(movedTrack.id, movedTrack.position);
      
      return { trackId: movedTrack.id, position: movedTrack.position };
    },
    
    onMutate: async ({ folderId, oldIndex, newIndex }) => {
      await queryClient.cancelQueries({ 
        queryKey: trackKeys.list(folderId) 
      });
      
      const previousTracks = queryClient.getQueryData<Track[]>(
        trackKeys.list(folderId)
      );
      
      if (!previousTracks) return { previousTracks, folderId };
      
      const sortedTracks = [...previousTracks].sort((a, b) => a.position.localeCompare(b.position));
      const movedTrack = sortedTracks[oldIndex];
      
      let prevPosition: string | null = null;
      let nextPosition: string | null = null;
      
      if (oldIndex < newIndex) {
        prevPosition = sortedTracks[newIndex].position;
        if (newIndex < sortedTracks.length - 1) {
          nextPosition = sortedTracks[newIndex + 1].position;
        }
      } else if (oldIndex > newIndex) {
        nextPosition = sortedTracks[newIndex].position;
        if (newIndex > 0) {
          prevPosition = sortedTracks[newIndex - 1].position;
        }
      } else {
        return { trackId: movedTrack.id, position: movedTrack.position };
      }
      
      const newPosition = getPositionBetween(prevPosition, nextPosition);
      
      const updatedTracks = previousTracks.map(track => 
        track.id === movedTrack.id 
          ? { ...track, position: newPosition }
          : track
      );
      
      queryClient.setQueryData(
        trackKeys.list(folderId),
        updatedTracks
      );
      
      return { previousTracks, folderId };
    },
    
    onError: (error, variables, context) => {
      if (!context || !context.previousTracks) return;
      queryClient.setQueryData(
        trackKeys.list(context.folderId),
        context.previousTracks
      );
    },
  });
}
```

#### `hooks/mutations/use-move-track-to-folder.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackKeys, folderKeys } from '@/lib/tanstack-query/keys';
import { moveTrackToFolder as moveTrackToFolderApi } from '@/lib/api/tracks';
import type { Track } from '@/lib/api/tracks';

export function useMoveTrackToFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      trackId, 
      oldFolderId, 
      newFolderId 
    }: { 
      trackId: string; 
      oldFolderId: string | null; 
      newFolderId: string | null; 
    }) => {
      const result = await moveTrackToFolderApi(trackId, newFolderId);
      return result;
    },
    
    onMutate: async ({ trackId, oldFolderId, newFolderId }) => {
      // Cancel all relevant queries
      await queryClient.cancelQueries({ queryKey: trackKeys.list(oldFolderId) });
      await queryClient.cancelQueries({ queryKey: trackKeys.list(newFolderId) });
      
      const oldTracks = queryClient.getQueryData<Track[]>(trackKeys.list(oldFolderId)) || [];
      const newTracks = queryClient.getQueryData<Track[]>(trackKeys.list(newFolderId)) || [];
      
      const movedTrack = oldTracks.find(t => t.id === trackId);
      
      if (!movedTrack) return { oldTracks, newTracks, oldFolderId, newFolderId };
      
      // Remove from old folder
      queryClient.setQueryData(
        trackKeys.list(oldFolderId),
        oldTracks.filter(t => t.id !== trackId)
      );
      
      // Add to new folder (will be updated with real position after mutation)
      queryClient.setQueryData(
        trackKeys.list(newFolderId),
        [...newTracks, { ...movedTrack, folder_id: newFolderId }]
      );
      
      return { oldTracks, newTracks, oldFolderId, newFolderId };
    },
    
    onSuccess: (updatedTrack) => {
      // Update the moved track with its new position
      queryClient.setQueriesData(
        { queryKey: trackKeys.list(updatedTrack.folder_id) },
        (oldData: Track[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(track => 
            track.id === updatedTrack.id ? updatedTrack : track
          );
        }
      );
    },
    
    onError: (error, variables, context) => {
      if (!context) return;
      
      // Rollback changes
      queryClient.setQueryData(
        trackKeys.list(context.oldFolderId),
        context.oldTracks
      );
      queryClient.setQueryData(
        trackKeys.list(context.newFolderId),
        context.newTracks
      );
    },
  });
}
```

---

## Phase 3: Cross-Entity DND Components

### 3.1 Mixed Virtualized List

#### `components/library/ui/virtualized-mixed-list.tsx`
```typescript
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useReorderFolders } from '@/hooks/mutations/use-reorder-folders';
import { useReorderTracks } from '@/hooks/mutations/use-reorder-tracks';
import { useMoveTrackToFolder } from '@/hooks/mutations/use-move-track-to-folder';
import { SortableFolder } from './draggable-folder';
import { DraggableTrack } from './draggable-track';
import { FolderDragOverlay } from './folder-drag-overlay';
import { TrackDragOverlay } from './track-drag-overlay';
import { Folder } from '@/lib/api/folders';
import { Track } from '@/lib/api/tracks';

interface MixedItem {
  id: string;
  type: 'folder' | 'track';
  data: Folder | Track;
}

interface VirtualizedMixedListProps {
  folders: Folder[];
  tracks: Track[];
  parentId: string | null;
  onSelectFolder: (folderId: string, folderName: string) => void;
  onSelectTrack?: (trackId: string) => void;
  selectedParentId: string | null;
  containerHeight?: number;
}

export function VirtualizedMixedList({ 
  folders, 
  tracks, 
  parentId, 
  onSelectFolder,
  onSelectTrack,
  selectedParentId,
  containerHeight = 600 
}: VirtualizedMixedListProps) {
  const reorderFolders = useReorderFolders();
  const reorderTracks = useReorderTracks();
  const moveTrackToFolder = useMoveTrackToFolder();
  
  const [isDragging, setIsDragging] = useState(false);
  const [activeItem, setActiveItem] = useState<MixedItem | null>(null);
  const [localItems, setLocalItems] = useState<MixedItem[]>([]);
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Create mixed items list: folders first, then tracks
  useEffect(() => {
    const folderItems: MixedItem[] = folders.map(folder => ({
      id: `folder-${folder.id}`,
      type: 'folder' as const,
      data: folder
    }));
    
    const trackItems: MixedItem[] = tracks.map(track => ({
      id: `track-${track.id}`,
      type: 'track' as const,
      data: track
    }));
    
    setLocalItems([...folderItems, ...trackItems]);
  }, [folders, tracks]);
  
  const overlayContent = () => {
    if (!activeItem) return null;
    
    if (activeItem.type === 'folder') {
      return <FolderDragOverlay folder={activeItem.data as Folder} />;
    } else {
      return <TrackDragOverlay track={activeItem.data as Track} />;
    }
  };

  const virtualizer = useVirtualizer({
    count: localItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    setIsDragging(true);
    const { active } = event;
    const item = localItems.find(i => i.id === active.id);
    setActiveItem(item || null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) {
      setActiveItem(null);
      setIsDragging(false);
      return;
    }
    
    const draggedItemIndex = localItems.findIndex(item => item.id === active.id);
    const targetIndex = localItems.findIndex(item => item.id === over.id);
    
    if (draggedItemIndex === -1 || targetIndex === -1) {
      setActiveItem(null);
      setIsDragging(false);
      return;
    }
    
    const draggedItem = localItems[draggedItemIndex];
    const targetItem = localItems[targetIndex];
    
    // Handle different drag scenarios
    if (draggedItem.id === targetItem.id) {
      // No movement
    } else if (draggedItem.type === targetItem.type) {
      // Same type: reorder within type
      if (draggedItem.type === 'folder') {
        const folderOldIndex = folders.findIndex(f => f.id === (draggedItem.data as Folder).id);
        const folderNewIndex = folders.findIndex(f => f.id === (targetItem.data as Folder).id);
        reorderFolders.mutate({ parentId, oldIndex: folderOldIndex, newIndex: folderNewIndex });
      } else {
        const trackOldIndex = tracks.findIndex(t => t.id === (draggedItem.data as Track).id);
        const trackNewIndex = tracks.findIndex(t => t.id === (targetItem.data as Track).id);
        reorderTracks.mutate({ folderId: parentId, oldIndex: trackOldIndex, newIndex: trackNewIndex });
      }
    } else {
      // Cross-type: move track near folder (to same folder)
      if (draggedItem.type === 'track' && targetItem.type === 'folder') {
        const track = draggedItem.data as Track;
        const targetFolder = targetItem.data as Folder;
        
        if (track.folder_id !== targetFolder.id) {
          moveTrackToFolder.mutate({
            trackId: track.id,
            oldFolderId: track.folder_id,
            newFolderId: targetFolder.id
          });
        }
      }
    }
    
    // Update local state immediately for instant feedback
    const newItems = [...localItems];
    const [movedItem] = newItems.splice(draggedItemIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    setLocalItems(newItems);
    
    setActiveItem(null);
    setIsDragging(false);
  }

  return (
    <div className={`mixed-sortable-list ${isDragging ? 'dragging' : ''}`}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext 
          items={localItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div 
            ref={parentRef}
            style={{ 
              height: `${containerHeight}px`, 
              overflow: 'auto' 
            }}
          >
            <div 
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const item = localItems[virtualItem.index];
                if (!item) return null;
                
                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {item.type === 'folder' ? (
                      <SortableFolder
                        key={item.id}
                        folder={item.data as Folder}
                        onClick={() => onSelectFolder((item.data as Folder).id, (item.data as Folder).name)}
                        onContextMenu={() => {}}
                      />
                    ) : (
                      <DraggableTrack
                        key={item.id}
                        track={item.data as Track}
                        onClick={() => onSelectTrack?.((item.data as Track).id)}
                        onContextMenu={() => {}}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </SortableContext>
        
        {createPortal(
          <DragOverlay>
            {overlayContent()}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
```

---

## Phase 4: Integration and Polish

### 4.1 Update Library Component

#### `components/library/library.tsx` - Key Changes
```typescript
// Add track import
import { useTracks } from "@/hooks/queries/use-tracks";

// In the Library component:
export function Library() {
  // ... existing navigation and folder state
  
  // Add tracks data
  const { data: currentTracks = [], isLoading: isLoadingTracks } = useTracks(currentParentId);
  
  // ... existing handlers
  
  // In the return statement, replace VirtualizedSortableList with:
  return (
    <div className="flex flex-col h-full">
      {/* ... existing navigation and actions bars */}
      
      <div className="flex-1 overflow-hidden">
        {(isLoading || isLoadingTracks) ? (
          <FolderSkeletonList />
        ) : (
          <VirtualizedMixedList
            folders={currentFolders}
            tracks={currentTracks}
            parentId={currentParentId}
            onSelectFolder={handleFolderClick}
            onSelectTrack={(trackId) => {
              // For now, just log - can be expanded later
              console.log('Track clicked:', trackId);
            }}
            selectedParentId={currentParentId}
            containerHeight={600}
          />
        )}
      </div>
    </div>
  );
}
```

### 4.2 Add Track Sorting Utility

#### `utils/sort-utils.ts` - Add track sorting
```typescript
// Add to existing file:
export function sortTracksByPosition(tracks: Track[]): Track[] {
  return [...tracks].sort((a, b) => a.position.localeCompare(b.position));
}

export function sortMixedItems(items: MixedItem[]): MixedItem[] {
  return [...items].sort((a, b) => {
    // Folders come before tracks
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    
    // Within same type, sort by position
    const aPosition = (a.data as any).position;
    const bPosition = (b.data as any).position;
    return aPosition.localeCompare(bPosition);
  });
}
```

### 4.3 Update Create Track Mutation

#### Ensure `use-create-track.ts` handles position:
```typescript
// The updated createTrack function in API already handles position
// Just make sure the mutation hook uses it correctly
```

---

## Technical Architecture Decisions

### **1. Mixed List Strategy**
**Choice**: Single unified list with folders first, then tracks
- **Pros**: Seamless cross-entity dragging, single scroll context, visual consistency
- **Cons**: More complex state management
- **Implementation**: VirtualizedMixedList handles both entity types

### **2. Position Namespace**
**Choice**: Separate position spaces per folder
- **Folders**: Positions within parent folder
- **Tracks**: Positions within containing folder
- **Benefits**: Simplifies moves, prevents position conflicts, easier cache management

### **3. ID Management**
**Choice**: Prefixed IDs to prevent conflicts
- Folders: `folder-${id}`
- Tracks: `track-${id}`
- **Benefits**: Prevents @dnd-kit ID collisions between entity types

### **4. Mutation Strategy**
**Choice**: Separate mutations for each operation
- `useReorderFolders`: Within-folder reordering
- `useReorderTracks`: Within-folder track reordering  
- `useMoveTrackToFolder`: Cross-folder track moves
- **Benefits**: Clear separation of concerns, targeted cache invalidation

### **5. Error Handling**
- Optimistic updates with rollback on failure
- Targeted cache invalidation (only affected folders)
- Consistent error messages matching folder implementation

---

## Success Criteria

### **Phase 1 Completion**
- ✅ Tracks have position field populated correctly
- ✅ Track API functions work with position ordering
- ✅ Track queries return data sorted by position

### **Phase 2 Completion**
- ✅ Tracks can be dragged and reordered within their folder
- ✅ Track DND has same visual feedback as folders
- ✅ Track reordering persists to database with optimistic updates

### **Phase 3 Completion**
- ✅ Mixed list displays folders then tracks seamlessly
- ✅ Tracks can be dragged to folders (moves between folders)
- ✅ Cross-entity dragging maintains position integrity
- ✅ Virtualization works smoothly with mixed content

### **Phase 4 Completion**
- ✅ Library component displays both folders and tracks
- ✅ All drag operations are smooth and responsive
- ✅ Error handling matches existing folder implementation
- ✅ Cache management remains consistent

---

## Files to Create/Modify

### **New Files**
```
hooks/mutations/use-reorder-tracks.ts
hooks/mutations/use-move-track-to-folder.ts
components/library/ui/draggable-track.tsx
components/library/ui/track-drag-overlay.tsx
components/library/ui/virtualized-mixed-list.tsx
```

### **Modified Files**
```
types/library.types.ts (add position to Track)
lib/api/tracks.ts (add position functions)
lib/tanstack-query/keys.ts (add track keys)
hooks/queries/use-tracks.ts (sort by position)
components/library/ui/track-item.tsx (DND compatibility)
components/library/library.tsx (use mixed list)
utils/sort-utils.ts (add track sorting)
```

### **Database**
```
tracks table (add position column, index)
```

---

## Implementation Notes

### **Dependencies**
All required dependencies are already installed:
- ✅ @dnd-kit packages
- ✅ @tanstack/react-virtual
- ✅ TanStack Query
- ✅ fractional-indexing

### **Code Patterns**
The implementation follows existing patterns exactly:
- Same mutation structure as `use-reorder-folders.ts`
- Same component patterns as folder DND components
- Same cache management as existing queries
- Same error handling and optimistic update patterns

### **Performance Considerations**
- Virtualization handles any number of items
- Fractional indexing never requires rebalancing
- Optimistic updates provide instant feedback
- Targeted cache invalidation prevents unnecessary refetches

This plan provides enterprise-grade track DND that matches the quality and performance of the existing folder implementation while adding powerful cross-entity functionality.
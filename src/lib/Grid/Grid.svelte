<script lang="ts">
    import { onMount } from 'svelte';
    import { flip } from 'svelte/animate';

    // https://stackoverflow.com/a/72532661
    type Component = $$Generic<typeof SvelteComponentTyped<any, any, any>>;
    
    export let columns: number = 1;
    export let gap: number = 0;
    export let animationDuration: number = 300;
    export let dragAxis: string = 'xy';
    export let itemComponent: Component;
    export let itemsData: any[];
    export let maxScrollSpeed = 8;
    export let scrollElement: HTMLElement = document.documentElement;
    export let onDrop: Function;

    let grid: HTMLDivElement;
    let dragContainer: HTMLDivElement;
    let draggedItem: {
        element: HTMLElement | null;
        hasDragged: boolean;
        initialIndex: number;
        mouseOffset: { x: number; y: number; };
    }
    let draggedIndex: number = -1;
    // there may be more than one dummy/dragged items existing if we spam drag, so we track them
    let residualDummyIndices: number[] = [];
    let residualDraggedItems: {
        element: HTMLElement | null;
        itemOffset: { x: number; y: number; };
    }[] = [];
    let isAutoScrolling = false;

    $: if (grid) grid.style.gap = `${gap}px`;
    $: if (grid) grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;

    onMount(() => {
        initDraggedItem();

        /* There is an issue where scrolling with a dragged item near the top of the viewport
         * at a slow enough speed to not completely skip over the adjacent item results in the
         * item and its adjacent item to repeatedly switch and triggers something to scroll
         * down (possibly toward the item that got switched downward), ultimately becoming an
         * endless cycle of scrolling up and down the same spot. Disabling updates to the item
         * order makes the scrolling issue disappear, but we don't want to sacrifice that
         * ability. The below CSS property change fixes the issue completely.
         * https://stackoverflow.com/a/73514605
        */
        scrollElement.style.overflowAnchor = 'none';
        
        function initDraggedItem() {
            draggedItem = {
                element: null,
                hasDragged: false,
                initialIndex: -1,
                mouseOffset: {
                    x: 0,
                    y: 0
                }
            }
        }

        function calculateIndexFromPoint(x: number, y: number): number {
            const gridRect = grid.getBoundingClientRect();

            const relativeX = x - gridRect.left;
            const relativeY = y - gridRect.top;

            // how many columns/rows can there be with the current number of items
            const maxColumns = Math.min(itemsData.length, columns);
            const maxRows = Math.ceil(itemsData.length / columns);

            const columnWidth = grid.offsetWidth / columns;
            let column = Math.floor(relativeX / columnWidth);
            column = Math.max(column, 0);
            column = Math.min(column, maxColumns - 1)

            const item = grid.querySelector('.item') as HTMLElement;
            let row = Math.floor(relativeY / (item.offsetHeight + gap / 2));
            row = Math.max(row, 0);
            row = Math.min(row, maxRows - 1)

            let index = row * columns + column;
            index = Math.min(index, itemsData.length - 1);

            return index;
        }

        function calculatePointFromIndex(index: number): { x: number; y: number; } {
            const column = index % columns;
            const row = Math.floor(index / columns);

            const gridRect = grid.getBoundingClientRect();
            const item = grid.querySelector('.item') as HTMLElement;

            return {
                x: gridRect.left + column * (item.offsetWidth + gap),
                y: gridRect.top + row * (item.offsetHeight + gap)
            }
        }

        function updatePlacement() {
            if (!draggedItem.element) return;

            const draggedItemRect = draggedItem.element.getBoundingClientRect();
            const x = draggedItemRect.left + draggedItemRect.width / 2;
            const y = draggedItemRect.top + draggedItemRect.height / 2;

            const index = calculateIndexFromPoint(x, y);
            if (draggedIndex === index) return;

            const temp = itemsData[draggedIndex];
            if (index > draggedIndex) {
                for (let i = draggedIndex; i < index; i++)
                    itemsData[i] = itemsData[i + 1]
            } else {
                for (let i = draggedIndex; i > index; i--)
                    itemsData[i] = itemsData[i - 1]
            }

            itemsData[index] = temp;
            draggedIndex = index;
        }

        function handleAutoScroll(selfCall = false) {
            if (isAutoScrolling && !selfCall || !draggedItem.element) return;

            const scrollElementRect = scrollElement.getBoundingClientRect();
            const draggedItemRect = draggedItem.element.getBoundingClientRect();

            const scrollLeftPos = Math.max(scrollElementRect.left, 0) + draggedItemRect.width;
            const scrollRightPos = Math.min(scrollElementRect.right, window.innerWidth) - draggedItemRect.width;
            const scrollUpPos = Math.max(scrollElementRect.top, 0) + draggedItemRect.height;
            const scrollDownPos = Math.min(scrollElementRect.bottom, window.innerHeight) - draggedItemRect.height;

            let overlapPercent = { x: 0, y: 0 };

            if (draggedItemRect.left < scrollLeftPos) {
                overlapPercent.x = -Math.min((scrollLeftPos - draggedItemRect.left) / draggedItemRect.width, 1);
            } else if (draggedItemRect.right > scrollRightPos) {
                overlapPercent.x = Math.min((draggedItemRect.right - scrollRightPos) / draggedItemRect.width, 1);
            }

            if (draggedItemRect.top < scrollUpPos) {
                overlapPercent.y = -Math.min((scrollUpPos - draggedItemRect.top) / draggedItemRect.height, 1);
            } else if (draggedItemRect.bottom > scrollDownPos) {
                overlapPercent.y = Math.min((draggedItemRect.bottom - scrollDownPos) / draggedItemRect.height, 1);
            }

            // if single drag axis, overlapPercent is likely not 0 for the opposite axis
            if ((overlapPercent.x === 0 || !dragAxis.includes('x')) && (overlapPercent.y === 0 || !dragAxis.includes('y'))) {
                isAutoScrolling = false;
                return;
            }

            isAutoScrolling = true;
            scrollElement.scrollBy(maxScrollSpeed * overlapPercent.x, maxScrollSpeed * overlapPercent.y);
            
            requestAnimationFrame(() => handleAutoScroll(true));
        }

        function onMouseDown(event: MouseEvent) {
            if (event.button != 0 || draggedItem.element) return;
            
            const item = (event.target as HTMLElement).closest('.item') as HTMLElement;
            if (!item) return;

            // disables dragging of elements (e.g. images) that are part of the item
            event.preventDefault();

            draggedItem.element = item;
            draggedItem.initialIndex = Array.prototype.indexOf.call(grid.children, item);

            // get mouse position relative to ihe item so we can maintain the offset when dragging
            const rect = item.getBoundingClientRect();
            draggedItem.mouseOffset = {
                x: event.clientX - rect.x,
                y: event.clientY - rect.y
            }
        }
        
        function onMouseMove(event: MouseEvent) {
            /* handle dragged item */
            if (!draggedItem.element) return;

            // the frame we start dragging
            if (!draggedItem.hasDragged) {
                const realItem = draggedItem.element;

                const index = Array.prototype.indexOf.call(grid.children, realItem);
                draggedIndex = index;
                
                // do not clone .item div because that contains animation styling in the case that the real item is in the middle of animate:flip
                draggedItem.element = document.createElement('div');
                draggedItem.element.appendChild(realItem.firstElementChild?.cloneNode(true) as Node);
                draggedItem.element.style.position = 'absolute';
                draggedItem.element.style.width = `${realItem.offsetWidth}px`;
                draggedItem.element.style.transition = `transform ${animationDuration}ms`;
                // allow the mouseover listener to detect underneath the dragged item
                draggedItem.element.style.pointerEvents = 'none';

                draggedItem.hasDragged = true;

                dragContainer.appendChild(draggedItem.element);
            }

            const dragContainerRect = dragContainer.getBoundingClientRect();
            let x = event.clientX - dragContainerRect.left - draggedItem.mouseOffset.x;
            let y = event.clientY - dragContainerRect.top - draggedItem.mouseOffset.y;
            if (dragAxis.includes('x')) draggedItem.element.style.left = `${x}px`;
            if (dragAxis.includes('y')) draggedItem.element.style.top = `${y}px`;

            // no need to call updatePlacement twice since it is also called in the scroll listener
            if (!isAutoScrolling) updatePlacement();
            handleAutoScroll();
        }

        function onMouseUp(event: MouseEvent) {
            if (event.button != 0 && event.button != 2 || !draggedItem.element) return;
            // the case where we just click and not actually drag
            if (!draggedItem.hasDragged) {
                initDraggedItem()
                return;
            }

            const realItemRect = calculatePointFromIndex(draggedIndex);
            const draggedItemRect = draggedItem.element.getBoundingClientRect();
            draggedItem.element.style.transform = `translate(${realItemRect.x - draggedItemRect.left}px, ${realItemRect.y - draggedItemRect.top}px)`;
            draggedItem.element.addEventListener('transitionend', (event: TransitionEvent) => {
                residualDraggedItems.shift();
                residualDummyIndices.shift();
                residualDummyIndices = residualDummyIndices;
                // removes this event listener as well
                (event.target as HTMLElement).remove();
            });

            if (draggedItem.initialIndex !== draggedIndex) {
                const newIds = Array.from(grid.children).map(item => (item as HTMLElement).dataset.id);
                onDrop(newIds);
            }

            const dragContainerRect = dragContainer.getBoundingClientRect();
            residualDraggedItems.push({
                element: draggedItem.element,
                itemOffset: {
                    x: draggedItemRect.left - dragContainerRect.left + scrollElement.scrollLeft,
                    y: draggedItemRect.top - dragContainerRect.top + scrollElement.scrollTop
                }
            });
            residualDummyIndices.push(draggedIndex);
            draggedIndex = -1;

            isAutoScrolling = false;
            initDraggedItem();
        }

        function onScroll(event: Event) {
            // simulate relative positioning on released dragged items
            residualDraggedItems.forEach(item => {
                const elem = item.element as HTMLElement;
                elem.style.left = `${item.itemOffset.x - scrollElement.scrollLeft}px`;
                elem.style.top = `${item.itemOffset.y - scrollElement.scrollTop}px`;
            })

            updatePlacement();
        }

        grid.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('scroll', onScroll);

        return () => {
            grid.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('scroll', onScroll);
        }
    });
</script>

<style>
    .drag-container {
        position: fixed;
        z-index: 9999;
        /* remove any inherited margin and padding */
        margin: 0!important;
        padding: 0!important;
    }

    .grid {
        display: grid;
    }

    .dummy {
        opacity: 0.2;
        z-index: -1;
    }
</style>

<div class="drag-container" bind:this={dragContainer} />
<div class="grid" bind:this={grid}>
    {#each itemsData as item, index (item.id)}
        <div
            class={index === draggedIndex || residualDummyIndices.includes(index) ? 'item dummy' : 'item'}
            data-id={item.id}
            animate:flip={{ duration: animationDuration }}
        >
            <svelte:component this={itemComponent} {item} />
        </div>
    {/each}
</div>

<!-- 
todo:
small delay before placement update
drag handles
virtualization
-->
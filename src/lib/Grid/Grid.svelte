<script lang="ts">
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';

    // https://stackoverflow.com/a/72532661
    type Component = $$Generic<typeof SvelteComponentTyped<any, any, any>>;
    
    export let columns: number = 1;
    export let gap: number = 0;
    export let animationDuration: number = 300;
    export let dragAxis: string = 'xy';
    export let itemComponent: Component;
    export let itemsData: any[];
    export let maxScrollSpeed = 8;
    export let autoScrollThreshold = 50;
    export let scrollElement: HTMLElement = document.documentElement;
    export let onDrop: Function;

    let virtualTop: HTMLDivElement;
    let virtualBottom: HTMLDivElement;
    let grid: HTMLDivElement;
    let gridFormatter: HTMLDivElement;
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
    let visibleItems: any[] = [];
    let mounted = false;
    let isAutoScrolling = false;
    let prevScrollTop = 0;
    let startIndex = 0;
    let stopIndex = 0;

    // non-positive columns will have unintended consequences
    $: columns = Math.max(columns, 1);
    $: if (gridFormatter) gridFormatter.style.gap = `${gap}px`;
    $: if (gridFormatter) gridFormatter.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    $: if (columns || gap || itemsData.length !== 0) {
        // ensure at least one item exists so querySelector('.item') works
        if (visibleItems.length === 0) visibleItems = [itemsData[0]];
        if (mounted) handleVirtualization();
    }
    $: if (startIndex || stopIndex) {
        const totalHeight = calculateOffsetFromIndex(itemsData.length - 1 + columns).y - gap;
        // manually calculate height since grid-formatter hasn't updated yet
        const gridFormatterHeight = calculateOffsetFromIndex(stopIndex - startIndex + columns).y - gap;
        const virtualTopHeight = calculateOffsetFromIndex(startIndex).y;
        const virtualBottomHeight = totalHeight - virtualTopHeight - gridFormatterHeight;
        virtualTop.style.height = `${virtualTopHeight}px`;
        virtualBottom.style.height = `${virtualBottomHeight}px`;
    }

    onMount(() => {
        mounted = true;
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

        function calculatePointFromIndex(index: number): { x: number; y: number; } {
            const gridRect = grid.getBoundingClientRect();
            const offset = calculateOffsetFromIndex(index);
            return {
                x: gridRect.left + offset.x,
                y: gridRect.top + offset.y
            }
        }

        function animateElement(element: HTMLElement, startPos: { x: number; y: number; }, endPos: { x: number; y: number; }) {
            // https://aerotwist.com/blog/flip-your-animations/
            // disallow dragging of in-transition items
            element.style.pointerEvents = 'none';
            // need to clear transition to allow for replacing with a new transition before an existing one is over
            element.style.transition = '';
            element.style.transform = `translate(${startPos.x - endPos.x}px, ${startPos.y - endPos.y}px)`;
            requestAnimationFrame(() => {
                element.style.transition = `transform ${animationDuration}ms`;
                element.style.transform = '';
            });
            element.addEventListener('transitionend', (event: TransitionEvent) => {
                element.style.pointerEvents = '';
                element.style.transition = '';
            });
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
                for (let i = draggedIndex; i < index; i++) {
                    itemsData[i] = itemsData[i + 1];

                    const nextItem = gridFormatter.children[i + 1 - startIndex] as HTMLElement;
                    if (!nextItem) continue;
                    
                    const startPos = nextItem.getBoundingClientRect();
                    const endPos = calculatePointFromIndex(i);
                    animateElement(nextItem, startPos, endPos);
                }
            } else {
                for (let i = draggedIndex; i > index; i--) {
                    itemsData[i] = itemsData[i - 1];

                    const prevItem = gridFormatter.children[i - 1 - startIndex] as HTMLElement;
                    if (!prevItem) continue;
                    
                    const startPos = prevItem.getBoundingClientRect();
                    const endPos = calculatePointFromIndex(i);
                    animateElement(prevItem, startPos, endPos);
                }
            }

            const dummyItem = gridFormatter.children[draggedIndex - startIndex] as HTMLElement;
            if (dummyItem) {
                const startPos = dummyItem.getBoundingClientRect();
                const endPos = calculatePointFromIndex(index);
                animateElement(dummyItem, startPos, endPos);
            }

            itemsData[index] = temp;
            draggedIndex = index;
            handleVirtualization(true);
        }

        function handleAutoScroll(selfCall=false) {
            if (isAutoScrolling && !selfCall || !draggedItem.element) return;

            const scrollElementRect = scrollElement.getBoundingClientRect();
            const draggedItemRect = draggedItem.element.getBoundingClientRect();

            const scrollLeftPos = Math.max(scrollElementRect.left, 0) + autoScrollThreshold;
            const scrollRightPos = Math.min(scrollElementRect.right, window.innerWidth) - autoScrollThreshold;
            const scrollUpPos = Math.max(scrollElementRect.top, 0) + autoScrollThreshold;
            const scrollDownPos = Math.min(scrollElementRect.bottom, window.innerHeight) - autoScrollThreshold;

            let overlapPercent = { x: 0, y: 0 };
            if (draggedItemRect.left < scrollLeftPos) {
                overlapPercent.x = -Math.min((scrollLeftPos - draggedItemRect.left) / autoScrollThreshold, 1);
            } else if (draggedItemRect.right > scrollRightPos) {
                overlapPercent.x = Math.min((draggedItemRect.right - scrollRightPos) / autoScrollThreshold, 1);
            }
            if (draggedItemRect.top < scrollUpPos) {
                overlapPercent.y = -Math.min((scrollUpPos - draggedItemRect.top) / autoScrollThreshold, 1);
            } else if (draggedItemRect.bottom > scrollDownPos) {
                overlapPercent.y = Math.min((draggedItemRect.bottom - scrollDownPos) / autoScrollThreshold, 1);
            }

            isAutoScrolling = true;
            scrollElement.scrollBy(maxScrollSpeed * overlapPercent.x, maxScrollSpeed * overlapPercent.y);
            requestAnimationFrame(() => handleAutoScroll(true));
        }

        function onMouseDown(event: MouseEvent) {
            if (event.button != 0 || draggedItem.element) return;
            
            const item = (event.target as HTMLElement).closest('.item') as HTMLElement;
            if (!item) return;

            let dragHandle = item.querySelector('.drag-handle');
            if (dragHandle) {
                dragHandle = (event.target as HTMLElement).closest('.drag-handle') as HTMLElement;
                if (!dragHandle) return;
            }

            // disables dragging of elements (e.g. images) that are part of the item
            event.preventDefault();

            draggedItem.element = item;
            draggedItem.initialIndex = startIndex + Array.prototype.indexOf.call(gridFormatter.children, item);

            // get mouse position relative to ihe item so we can maintain the offset when dragging
            const rect = item.getBoundingClientRect();
            draggedItem.mouseOffset = {
                x: event.clientX - rect.x,
                y: event.clientY - rect.y
            }
        }
        
        function onMouseMove(event: MouseEvent) {
            if (!draggedItem.element) return;

            // the frame we start dragging
            if (!draggedItem.hasDragged) {
                const realItem = draggedItem.element;
                draggedIndex = draggedItem.initialIndex;
                
                // do not clone .item div because that contains animation styling in the case that the real item is in the middle of animate:flip
                draggedItem.element = document.createElement('div');
                draggedItem.element.appendChild(realItem.firstElementChild?.cloneNode(true) as Node);
                draggedItem.element.style.position = 'absolute';
                draggedItem.element.style.width = `${realItem.offsetWidth}px`;
                // trigger transitionend even when animationDuration = 0
                draggedItem.element.style.transition = `transform ${Math.max(animationDuration, 1)}ms`;
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

            updatePlacement();
            handleAutoScroll();
        }

        function onMouseUp(event: MouseEvent) {
            if (event.button != 0 && event.button != 2 || !draggedItem.element) return;
            // the case where we just click and not actually drag
            if (!draggedItem.hasDragged) {
                initDraggedItem()
                return;
            }

            const draggedItemRect = draggedItem.element.getBoundingClientRect();
            const realItemRect = calculatePointFromIndex(draggedIndex);
            draggedItem.element.style.transform = `translate(${realItemRect.x - draggedItemRect.left}px, ${realItemRect.y - draggedItemRect.top}px)`;
            draggedItem.element.addEventListener('transitionend', (event: TransitionEvent) => {
                residualDraggedItems.shift();
                residualDummyIndices.shift();
                residualDummyIndices = residualDummyIndices;
                // removes this event listener as well
                (event.target as HTMLElement).remove();
            });

            if (draggedItem.initialIndex !== draggedIndex) {
                const newIds = itemsData.map(item => item.id);
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
            handleVirtualization();
        }

        gridFormatter.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('scroll', onScroll);

        return () => {
            gridFormatter.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('scroll', onScroll);
        }
    });

    // fixes stuttering when scrolling down right above the last item
    beforeUpdate(() => {
        prevScrollTop = scrollElement.scrollTop;
    })
    afterUpdate(() => {
        scrollElement.scrollTop = prevScrollTop;
    })

    function calculateOffsetFromIndex(index: number): { x: number; y: number; } {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const item = gridFormatter.querySelector('.item') as HTMLElement;
        return {
            x: column * (item.offsetWidth + gap),
            y: row * (item.offsetHeight + gap)
        }
    }
    
    function calculateIndexFromPoint(x: number, y: number): number {
        const gridRect = grid.getBoundingClientRect();

        const relativeX = x - gridRect.left;
        const relativeY = y - gridRect.top;

        // how many columns can there be with the current number of items
        const maxColumns = Math.min(itemsData.length, columns);
        const maxRows = Math.ceil(itemsData.length / columns);

        const columnWidth = grid.offsetWidth / columns;
        let column = Math.floor(relativeX / columnWidth);
        column = Math.max(column, 0);
        column = Math.min(column, maxColumns - 1)

        const item = gridFormatter.querySelector('.item') as HTMLElement;
        let row = Math.floor(relativeY / (item.offsetHeight + gap / 2));
        row = Math.max(row, 0);
        row = Math.min(row, maxRows - 1)

        let index = row * columns + column;
        index = Math.min(index, itemsData.length - 1);

        return index;
    }

    function isGridOutOfView(): boolean {
        const gridRect = grid.getBoundingClientRect();
        const x = gridRect.left > window.innerWidth || gridRect.right < 0;
        const y = gridRect.top > window.innerHeight || gridRect.bottom < 0;
        return x || y;
    }

    function handleVirtualization(forceUpdate=false) {
        if (!grid || visibleItems.length === 0) return;

        let _startIndex;
        let _stopIndex;
        if (isGridOutOfView()) {
            _startIndex = 0;
            _stopIndex = -1;
        } else {
            _startIndex = calculateIndexFromPoint(0, 0);
            _stopIndex = calculateIndexFromPoint(window.innerWidth, window.innerHeight);
        }

        if (!forceUpdate && startIndex == _startIndex && stopIndex == _stopIndex) return;

        startIndex = _startIndex;
        stopIndex = _stopIndex;
        visibleItems = itemsData.slice(startIndex, stopIndex + 1);
    }
</script>

<style>
    .drag-container {
        position: fixed;
        z-index: 9999;
        /* remove any inherited margin and padding */
        margin: 0!important;
        padding: 0!important;
    }

    .grid-formatter {
        display: grid;
    }

    .dummy {
        opacity: 0.2;
        z-index: -1;
    }
</style>

<div class="drag-container" bind:this={dragContainer} />
<div class="grid" bind:this={grid}>
    <div bind:this={virtualTop} />
    <div class="grid-formatter" bind:this={gridFormatter}>
        {#each visibleItems as item, index (item.id)}
            <div
                class={startIndex + index === draggedIndex || residualDummyIndices.includes(startIndex + index) ? 'item dummy' : 'item'}
                data-id={item.id}
            >
                <svelte:component this={itemComponent} {item} />
            </div>
        {/each}
    </div>
    <div bind:this={virtualBottom} />
</div>
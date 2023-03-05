<script lang="ts">
    import { onMount } from 'svelte';

    // https://stackoverflow.com/a/72532661
    type Component = $$Generic<typeof SvelteComponentTyped<any, any, any>>;
    
    export let columns: number = 1;
    export let gap: number = 0;
    export let itemComponent: Component;
    export let itemsData: any[];
    export let onDrop: Function;

    let grid: HTMLDivElement;
    let draggedItem: {
        element: HTMLElement | null;
        initialSibling: HTMLElement | null;
        offsetX: number;
        offsetY: number;
        hasDragged: boolean;
    }
    let dummy: {
        element: HTMLElement | null;
        nextSibling: Node | null;
    }

    onMount(() => {
        initDraggedItem();
        initDummy();

        function createDummyElement(toClone: HTMLElement) {
            const dummyElement = toClone.cloneNode(true) as HTMLElement;
            dummyElement.style.opacity = '0.2';
            dummyElement.style.position = '';
            dummyElement.style.left = '';
            dummyElement.style.top = '';

            return dummyElement;
        }

        function onMouseDown(event: MouseEvent) {
            if (draggedItem.element) return;
            
            const item = (event.target as HTMLElement).closest('.item') as HTMLElement;
            if (!item) return;

            // disables dragging of elements like images that are part of the item
            event.preventDefault();

            draggedItem.element = item;
            draggedItem.initialSibling = item.nextSibling as HTMLElement;

            // get mouse position relative to ihe item so we can maintain the offset when dragging
            const rect = item.getBoundingClientRect();
            draggedItem.offsetX = event.clientX - rect.x;
            draggedItem.offsetY = event.clientY - rect.y;
        }
        
        function onMouseMove(event: MouseEvent) {
            /* handle dragged item */
            if (!draggedItem.element) return;

            // aka the frame we start dragging
            if (!draggedItem.hasDragged) {
                // create intial dummy of the dragged item
                dummy.element = createDummyElement(draggedItem.element);
                dummy.nextSibling = draggedItem.element.nextSibling;
                grid.insertBefore(dummy.element, dummy.nextSibling);
                
                // fix the width of the dragged item when it is reparented to document.body
                const width = `${draggedItem.element.offsetWidth}px`;
                document.body.appendChild(draggedItem.element);
                draggedItem.element.style.width = width;

                // allow the mouseover listener to detect underneath the dragged item
                draggedItem.element.style.pointerEvents = 'none';

                draggedItem.hasDragged = true;
            }

            let x = event.clientX - draggedItem.offsetX;
            let y = event.clientY - draggedItem.offsetY;
            draggedItem.element.style.position = 'absolute';
            draggedItem.element.style.left = `${x}px`;
            draggedItem.element.style.top = `${y}px`;

            /* handle dummy item */
            const rect = draggedItem.element.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;

            // get the item of this grid that the mouse is over
            const overItem = document.elementFromPoint(x, y)?.closest('.item');
            if (!overItem || overItem.parentElement != grid) return;

            let nextSibling;
            // if overItem precedes the dummy
            if (overItem.compareDocumentPosition(dummy.element as Node) & Node.DOCUMENT_POSITION_FOLLOWING) {
                nextSibling = overItem;
            } else {
                nextSibling = overItem.nextSibling;
            }

            if (dummy.nextSibling === nextSibling) return;

            dummy.element?.remove();
            dummy.element = createDummyElement(draggedItem.element);
            dummy.nextSibling = nextSibling;
            grid.insertBefore(dummy.element, dummy.nextSibling);
        }

        function onMouseUp(event: MouseEvent) {
            if (!draggedItem.element) return;
            // the case where we just click and not actually drag
            if (!draggedItem.hasDragged) {
                draggedItem.element = null;
                return;
            }

            draggedItem.element.style.position = '';
            draggedItem.element.style.left = '';
            draggedItem.element.style.top = '';
            draggedItem.element.style.width = '';
            draggedItem.element.style.pointerEvents = '';

            grid.insertBefore(draggedItem.element, dummy.nextSibling);
            dummy.element?.remove();

            // if the sibling after the drag is different from the sibling before the drag
            if (draggedItem.element.nextSibling !== draggedItem.initialSibling) {
                const newIds = Array.from(grid.children).map(item => (item as HTMLElement).dataset.id);
                onDrop(newIds);
            }

            initDummy();
            initDraggedItem();
        }

        grid.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        return () => {
            grid.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    });

    function initDraggedItem() {
        draggedItem = {
            element: null,
            initialSibling: null,
            offsetX: 0,
            offsetY: 0,
            hasDragged: false
        }
    }

    function initDummy() {
        dummy = {
            element: null,
            nextSibling: null
        }
    }

    $: if (grid) grid.style.gap = `${gap}px`;
    $: if (grid) grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
</script>

<style>
    .grid {
        display: grid;
    }

    .item {
        transition: all 0.3s ease;
    }
</style>

<div class="grid" bind:this={grid}>
    {#each itemsData as item (item.id)}
        <div
            class="item"
            data-id={item.id}
        >
            <svelte:component this={itemComponent} {item} />
        </div>
    {/each}
</div>
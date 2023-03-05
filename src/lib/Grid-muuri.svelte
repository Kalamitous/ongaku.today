<script lang="ts">
    import { onMount } from 'svelte';
    import Muuri from 'muuri';

    // https://stackoverflow.com/a/72532661
    type Component = $$Generic<typeof SvelteComponentTyped<any, any, any>>;

    export let columns: number = 1;
    export let spaceBetween: number = 0;
    export let itemComponent: Component;
    export let itemsData: any[];
    export let onDrop: Function;

    let grid: Muuri;
    let gridElem: HTMLDivElement;
    let dragContainerElem: HTMLDivElement;
    let idToDataMap: Map<string, any>;
    let oldItemsData: any[] = [];
    let mounted = false;
    let clientWidth = 0;

    $: [idToDataMap, oldItemsData] = updateItems(oldItemsData, itemsData);
    $: itemWidth = Math.floor((clientWidth - spaceBetween * (columns - 1)) / columns) - 1;
    $: updateItemElemWidths(itemWidth);

    onMount(() => {
        gridElem.style.marginTop = '-' + spaceBetween + 'px';
        gridElem.style.marginLeft = '-' + spaceBetween + 'px';
        grid = new Muuri(gridElem, {
            layout: {
                // somehow fixes layout animation stutters
                rounding: true
            },
            layoutOnResize: true,
            layoutDuration: 300,
            dragEnabled: true,
            dragContainer: dragContainerElem,
            dragHandle: '.drag-handle',
            dragAxis: 'xy',
            dragAutoScroll: {
                targets: [window]
            },
            dragSortHeuristics: {
                sortInterval: 0
            },
            dragSortPredicate: {
                action: 'move'
            },
            dragRelease: {
                duration: 150
            }
        })
        .on('dragInit', function(item) {
            const elem = item.getElement() as HTMLElement;
            elem.style.width = item.getWidth() + 'px';
            elem.style.height = item.getHeight() + 'px';
        })
        .on('dragReleaseEnd', function(item) {
            const elem = item.getElement() as HTMLElement;
            elem.style.width = '';
            elem.style.height = '';

            grid.synchronize();

            const newItemsData = grid.getItems().map(item => {
                const id = item.getElement()?.id as string;
                return idToDataMap.get(id);
            })
            
            onDrop(newItemsData);
        });

        [idToDataMap, oldItemsData] = updateItems(oldItemsData, itemsData);
        mounted = true;
    })

    function updateItems(oldItemsData: any[], newItemsData: any[]): [Map<string, any>, any[]] {
        if (!mounted) return [new Map(), []];
        
        const oldItemIds = new Set(oldItemsData.map((data: any) => data.id));
        const newItemIds = new Set(newItemsData.map((data: any) => data.id));
        const itemsToRemove: Muuri.Item[] = [];
        oldItemsData.forEach((data: any, index: number) => {
            if (!(newItemIds.has(data.id))) {
                const item = grid.getItem(index);
                if (!item) throw Error('Invalid index');

                itemsToRemove.push(item);
            }
        });

        if (itemsToRemove.length > 0)
            grid.remove(itemsToRemove, { removeElements: true, layout: false });
        
        const idToDataMap = new Map();
        const itemsAdded: Muuri.Item[] = [];
        newItemsData.forEach((data: any, index: number) => {
            idToDataMap.set(data.id, data);
            if (!(oldItemIds.has(data.id))) {
                const item = createItemElem(data);
                const items = grid.add([item], { index: index, active: false, layout: false })
                itemsAdded.push(...items);
            }
        });

        grid.refreshItems();
        // adding the item hidden and showing them somehow gets rid of a single frame of the new items showing at the top of the grid
        grid.show(itemsAdded, { instant: true, layout: true });
        return [idToDataMap, newItemsData];
    }

    function createItemElem(data: any): HTMLDivElement {
        const div = document.createElement('div');
        div.className += 'item';
        div.id = data.id;

        new itemComponent({ target: div, props: { data: data } });

        const itemElem = div.firstChild as HTMLElement;
        itemElem.style.marginTop = spaceBetween + 'px';
        itemElem.style.marginLeft = spaceBetween + 'px';
        itemElem.style.width = itemWidth + 'px';
        
        return div;
    }

    function updateItemElemWidths(width: number) {
        if (!mounted || width <= 0) return;

        grid.getItems().forEach(item => {
            const elem = item.getElement()?.firstChild as HTMLElement;
            elem.style.width = width + 'px';
        });
    }
</script>

<style>
    .width {
        width: 100%;
    }

    .drag-container {
        position: fixed;
        z-index: 1000;
    }

    .muuri-grid {
        position: relative;
    }

    .muuri-grid > :global(.item) {
        position: absolute;
        z-index: 1;
    }
</style>

<div class="width" bind:clientWidth />
<div class="drag-container" bind:this={dragContainerElem} />
<div class="muuri-grid" bind:this={gridElem}  />
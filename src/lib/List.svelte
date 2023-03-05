<script lang="ts">
    import { onMount } from 'svelte';
    import Muuri from 'muuri';

    // https://stackoverflow.com/a/72532661
    type Component = $$Generic<typeof SvelteComponentTyped<any, any, any>>;

    export let itemsData: any[];
	export let itemComponent: Component;
    export let onDrop: Function;

    let list: Muuri;
    let listElem: HTMLDivElement;
    let dragContainerElem: HTMLDivElement;
    let mounted = false;
    let idToDataMap: Map<string, any>;
    let oldItemsData: any[] = [];

    $: [idToDataMap, oldItemsData] = updateItems(oldItemsData, itemsData);

    onMount(() => {
        list = new Muuri(listElem, {
            layout: {
                // somehow fixes animation stutters when dropping a dragged item close to the dragSortPredicate.threshold of another item
                rounding: true
            },
            dragEnabled: true,
            dragContainer: dragContainerElem,
            dragHandle: '.drag-handle',
            dragAxis: 'y',
            dragAutoScroll: {
                targets: [window]
            },
            dragSortPredicate: {
                action: 'move'
            },
            dragSortHeuristics: {
                sortInterval: 0
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

            list.synchronize();
            const newItemsData = list.getItems().map(item => {
                const id = item.getElement()?.id as string;
                return idToDataMap.get(id);
            })
            
            onDrop(newItemsData);
        })
        .on('layoutStart', function () {
            list.refreshItems().layout();
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
                const item = list.getItem(index);
                if (!item) throw Error('Invalid index');

                itemsToRemove.push(item);
            }
        });

        if (itemsToRemove.length > 0)
            list.remove(itemsToRemove, { removeElements: true, layout: false });
        
        const idToDataMap = new Map();
        const itemsAdded: Muuri.Item[] = [];
        newItemsData.forEach((data: any, index: number) => {
            idToDataMap.set(data.id, data);
            if (!(oldItemIds.has(data.id))) {
                const item = createItemElem(data);
                const items = list.add([item], { index: index, active: false, layout: false })
                itemsAdded.push(...items);
            }
        });

        // adding the item hidden and showing them somehow gets rid of a single frame of the new items showing at the top of the list
        list.show(itemsAdded, { instant: true });
        return [idToDataMap, newItemsData];
    }

    function createItemElem(data: any): HTMLDivElement {
        const div = document.createElement('div');
        div.classList.add('item', 'mt-1');
        div.id = data.id;

        new itemComponent({ target: div, props: { data: data } });
        return div;
    }
</script>

<style>
    .drag-container {
        position: fixed;
        z-index: 1000;
    }

    .list {
        position: relative;
    }

    .list > :global(.item) {
        position: absolute;
        width: 100%;
        z-index: 1;
    }
</style>

<div class="drag-container" bind:this={dragContainerElem} />
<div class='list !-mt-1' bind:this={listElem} />
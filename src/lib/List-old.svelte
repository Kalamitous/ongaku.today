<!--
This is a generic list component that allows drag handles to belong to the item component.

The tricky part was to get keyboard drag working. It works by keeping track of the root
div that parents each item component in the `refs` map. The reason why we cannot have each
item data contain a field that holds this ref instead is because accessing the ref would
require dot notation (i.e. `item.ref` instead of `refs[refIndex]`). For some unknown
reason, this causes an infinite loop when inside `bind:this` (see
https://github.com/sveltejs/svelte/issues/4317).

When a correct keydown occurs on the drag handle of the item component, we set
`dragDisabled` to false. A replicated keydown is triggered on the corresponding ref but
only after the change to `dragDisabled` updates the dnd element.
-->
<script lang="ts">
    import { afterUpdate } from 'svelte';
    import { flip } from "svelte/animate";
    import type { SvelteComponentTyped } from 'svelte/internal';
    import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';

    // https://stackoverflow.com/a/72532661
    type Component = $$Generic<typeof SvelteComponentTyped<any, any, any>>;

    export let itemsData: any;
	export let itemComponent: Component;
    export let onDrop: Function;
    export let flipDurationMs = 0;
    export let className: string;

    let refs: HTMLDivElement[] = [];
    // keeps track of the ref to keydown at drag start
    let refToKeydown: HTMLDivElement | undefined;
    let kbInitiatedDrag = false;
    let dragDisabled = true;

    $: itemsData = itemsData.map((data: any, index: number) => ({ ...data, refIndex: index }));

    afterUpdate(() => {
        refToKeydown?.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter'
        }));
        refToKeydown = undefined;
    });

    function handleConsider(e: any) {
		itemsData = e.detail.items;
        // ensure dragging is stopped on drag finish via keyboard
		if (e.detail.info.source === SOURCES.KEYBOARD && e.detail.info.trigger === TRIGGERS.DRAG_STOPPED) {
            kbInitiatedDrag = false;
            dragDisabled = true; 
		}
	}

    function handleFinalize(e: any) {
		itemsData = e.detail.items;
        onDrop(e.detail.items);
        // ensure dragging is stopped on drag finish via pointer (mouse, touch)
        if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}

    function startDrag(e: any) {
		// preventing default to prevent lag on touch devices (because of the browser checking for screen scrolling)
		e.preventDefault();
        dragDisabled = false;
	}

    function stopDrag(e: any) {
        dragDisabled = true;
	}

	function handleKeyDown(e: any, refIndex: number) {
		if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) {
            refToKeydown = refs[refIndex];
            kbInitiatedDrag = true;
            dragDisabled = false;
        }
	}

    function handleMouseDownParent(e: any) {
		e.preventDefault();
        // disallow dragging via pointer when dragging via keyboard has already been initiated
        if (kbInitiatedDrag) dragDisabled = true;
    }

    function handleMouseUpParent(e: any) {
        if (kbInitiatedDrag) dragDisabled = false;
    }
</script>

<style>
    section {
        height: 500px;
        overflow-y: scroll;
    }
    
    :global(#dnd-action-dragged-el) {
        outline: none;
	}
</style>

<section
    class={className}
    use:dndzone={{ items: itemsData, dragDisabled, flipDurationMs, dropTargetStyle: { outline: '0' } }}
    on:consider={handleConsider}
    on:finalize={handleFinalize}
>
    {#each itemsData as data (data.id)}
        <div
            animate:flip={{ duration: flipDurationMs }}
            bind:this={refs[data.refIndex]}
            on:mouseup={handleMouseUpParent}
            on:mousedown={handleMouseDownParent}
        >
            <svelte:component this={itemComponent}
                {data}
                isDragging={!dragDisabled}
                on:mouseup={stopDrag}
                on:mousedown={startDrag}
                on:touchstart={startDrag}
                on:keydown={e => handleKeyDown(e, data.refIndex)}
            />
        </div>
    {/each}
</section>
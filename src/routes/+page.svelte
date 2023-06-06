<script lang="ts">
    import LibraryData, { Folder } from '../lib/data';
    import Breadcrumbs from '../lib/Breadcrumbs.svelte';
    import ItemHeader from '../lib/ItemHeader.svelte';
    import FolderBody from '../lib/FolderBody.svelte';
    import PlaylistBody from '../lib/PlaylistBody.svelte';

    export let scrollableBody: HTMLElement;
    const curItemIdStore = LibraryData.getCurItemIdStore();
    $: curItem = LibraryData.getItemFromId($curItemIdStore);
</script>

<div class="mx-4 2xl:mx-[15%]">
    <Breadcrumbs id={$curItemIdStore} />
</div>
<ItemHeader item={curItem} />
<div class="mx-4 2xl:mx-[15%]">
    {#if curItem instanceof Folder}
        <FolderBody item={curItem} {scrollableBody} />
    {:else}
        <PlaylistBody item={curItem} {scrollableBody}/>
    {/if}
</div>
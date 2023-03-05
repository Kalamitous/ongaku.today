<script lang="ts">
    import LibraryData, { Folder } from '../lib/data';
    import Navbar from '../lib/Navbar.svelte';
    import Breadcrumbs from '../lib/Breadcrumbs.svelte';
    import ItemHeader from '../lib/ItemHeader.svelte';
    import FolderBody from '../lib/FolderBody.svelte';
    import PlaylistBody from '../lib/PlaylistBody.svelte';

    const curItemIdStore = LibraryData.getCurItemIdStore();

    $: curItem = LibraryData.getItemFromId($curItemIdStore);
</script>

<Navbar />
<div class="mx-4 2xl:mx-[15%]">
    <Breadcrumbs id={$curItemIdStore} />
</div>
<ItemHeader item={curItem} />
<div class="mx-4 2xl:mx-[15%]">
    {#if curItem instanceof Folder}
        <FolderBody item={curItem} />
    {:else}
        <PlaylistBody item={curItem} />
    {/if}
</div>

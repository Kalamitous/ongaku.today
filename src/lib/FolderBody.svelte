<script lang="ts">
    import LibraryData, { Folder, Playlist } from './data';
    import Grid from './Grid.svelte';
    import FolderCard from './FolderCard.svelte';
    import PlaylistCard from './PlaylistCard.svelte';

    export let item: Folder;
    export let scrollableBody: HTMLElement;

    let clientWidth = 0;

    $: folderIdsStore = item.folderIdsStore;
    $: playlistIdsStore = item.playlistIdsStore;
    $: folders = LibraryData.getItemsFromIds($folderIdsStore) as Folder[];
    $: playlists = LibraryData.getItemsFromIds($playlistIdsStore) as Playlist[];
    $: folderItemsData = folders.map(folder => (
        { id: folder.id, folder: folder, onClick: () => handleClickItem(folder.id) }
    ));
    $: playlistItemsData = playlists.map(playlist => (
        { id: playlist.id, playlist: playlist, onClick: () => handleClickItem(playlist.id) }
    ));
    $: columns = Math.floor(clientWidth / 250);

    function handleCreateFolder() {
        LibraryData.createFolder();
    }

    function handleCreatePlaylist() {
        LibraryData.createPlaylist();
    }

    function handleClickItem(id: string) {
        LibraryData.setCurItemId(id);
    }

    function onDropFolder(ids: string[]) {
        folderIdsStore.set(ids);
	}

    function onDropPlaylist(ids: string[]) {
        playlistIdsStore.set(ids);
	}
</script>

<div class="flex-col space-y-4" bind:clientWidth>
    <div class="grid gap-2 grid-cols-2">
        <button class="btn" on:click={handleCreateFolder}>+ Create Folder</button>
        <button class="btn" on:click={handleCreatePlaylist}>+ Create Playlist</button>
    </div>
    <div />
    {#if folders.length != 0}
        <Grid
            {columns}
            gap={8}
            itemComponent={FolderCard}
            itemsData={folderItemsData}
            scrollElement={scrollableBody}
            onDrop={onDropFolder}
        />
    {/if}
    {#if playlists.length != 0}
        <div />
        <Grid
            {columns}
            gap={8}
            itemComponent={PlaylistCard}
            itemsData={playlistItemsData}
            scrollElement={scrollableBody}
            onDrop={onDropPlaylist}
        />
    {/if}
    <div />
</div>
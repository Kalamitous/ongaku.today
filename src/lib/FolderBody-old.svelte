<script lang="ts">
    import LibraryData, { Folder, Playlist } from './data';
    import FolderCard from './FolderCard.svelte';
    import PlaylistCard from './PlaylistCard.svelte';

    export let item: Folder;
    
    let clientWidth = 0;
    let columns = 0;

    $: folderIdsStore = item.folderIdsStore;
    $: playlistIdsStore = item.playlistIdsStore;
    $: folders = LibraryData.getItemsFromIds($folderIdsStore) as Folder[];
    $: playlists = LibraryData.getItemsFromIds($playlistIdsStore) as Playlist[];
    $: columns = Math.floor(clientWidth / 300);

    function handleCreateFolder() {
        LibraryData.createFolder();
    }

    function handleCreatePlaylist() {
        LibraryData.createPlaylist();
    }

    function handleClickItem(id: string) {
        LibraryData.setCurItemId(id);
    }
</script>

<div class="flex-col space-y-8" bind:clientWidth>
    <div class="flex space-x-4">
        <button class="btn" on:click={handleCreateFolder}>+ Create Folder</button>
        <button class="btn" on:click={handleCreatePlaylist}>+ Create Playlist</button>
    </div>
    {#if folders.length != 0}
        <div class="grid gap-4" style="grid-template-columns:repeat({columns}, minmax(0, 1fr))">
            {#each folders as folder (folder.id)}
                <FolderCard {folder} on:click={() => handleClickItem(folder.id)} />
            {/each}
        </div>
    {/if}
    {#if playlists.length != 0}
        <div class="grid gap-4" style="grid-template-columns:repeat({columns}, minmax(0, 1fr))">
            {#each playlists as playlist (playlist.id)}
                <PlaylistCard {playlist} on:click={() => handleClickItem(playlist.id)} />
            {/each}
        </div>
    {/if}
</div>
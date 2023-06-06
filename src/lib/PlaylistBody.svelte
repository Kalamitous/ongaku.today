<script lang="ts">
    import LibraryData, { Playlist } from './data';
    import Grid from './Grid.svelte'
    import VideoCard from './VideoCard.svelte'

    export let item: Playlist;
    export let scrollableBody: HTMLElement;

    let videoUrl: string;

    $: videoIdsStore = item.videoIdsStore;
    $: videos = LibraryData.getVideosFromIds($videoIdsStore);
    $: itemsData = videos.map(video => ({ id: video.id, video: video }));

    function handleAddVideo() {
        if (!videoUrl) return;

        const re = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
        if (!videoUrl.match(re)) return;

        const id = videoUrl.replace(re, '$1');
        LibraryData.addVideo(id);
    }

    function onDrop(ids: string[]) {
        videoIdsStore.set(ids);
	}

    LibraryData.addVideo('wGs4xseE-vk');
    LibraryData.addVideo('vlqoJ3zTUN0');
    LibraryData.addVideo('i0aRv68tcPE');
    LibraryData.addVideo('vlqoJ3zTUa0');
    LibraryData.addVideo('vlqoJ3zvUN0');
    LibraryData.addVideo('vlqgJ3zTUN0');
    LibraryData.addVideo('vlqoJ3rTUN0');
    LibraryData.addVideo('vlqoJ3zTlN0');
    LibraryData.addVideo('vlqoJzzTUN0');
    LibraryData.addVideo('alqoJzzTUN0');
    LibraryData.addVideo('blqoJzzTUN0');
    LibraryData.addVideo('clqoJzzTUN0');
    LibraryData.addVideo('dlqoJzzTUN0');
    LibraryData.addVideo('elqoJzzTUN0');
    LibraryData.addVideo('elaoJzzTUN0');
    LibraryData.addVideo('elqbJzzTUN0');
    LibraryData.addVideo('elvoJzzTUN0');
    LibraryData.addVideo('eldoJzzTUN0');
    LibraryData.addVideo('eleoJzzTUN0');
</script>


<div class="flex-col space-y-4">
    <div class="input-group">
        <input type="text" placeholder="Enter YouTube link" class="input input-bordered w-full" bind:value={videoUrl} />
        <button class="btn" on:click={handleAddVideo}>Add Video</button>
    </div>
    <div />
    <Grid
        gap={4}
        itemComponent={VideoCard}
        dragAxis='y'
        scrollElement={scrollableBody}
        {itemsData}
        {onDrop}
    />
    <div />
</div>
<script lang="ts">
    import LibraryData, { Playlist } from './data';
    import List from './List.svelte'
    import VideoCard from './VideoCard.svelte'

    export let item: Playlist;

    let videoUrl: string;

    $: videoIdsStore = item.videoIdsStore;
    $: videos = LibraryData.getVideosFromIds($videoIdsStore);
    $: itemsData = videos.map(video => ({ id: video.id, video: video }));

    function handleAddVideo() {
        if (!videoUrl) return;

        const re = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
        if (!videoUrl.match(re)) return;

        const id = videoUrl.replace(re, '$1');
        if ($videoIdsStore.includes(id)) return;

        LibraryData.addVideo(id);
    }

    function onDrop(itemsData: any) {
        videoIdsStore.set(itemsData.map((data: any) => data.id));
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

</script>

<div class="flex-col space-y-8">
    <div class="input-group">
        <input type="text" placeholder="Enter YouTube link" class="input input-bordered w-full max-w-2xl" bind:value={videoUrl} />
        <button class="btn" on:click={handleAddVideo}>Add Video</button>
    </div>
    <List className={'space-y-1'} itemComponent={VideoCard} {itemsData} {onDrop} />
    <div />
</div>
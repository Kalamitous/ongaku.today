<script lang="ts">
    import QueueData from '../../lib/queue';
	import Grid from "$lib/Grid.svelte";
    import VideoCard from '$lib/VideoCard.svelte'
	import type { Video } from '$lib/data';

    export let onDrop: any;

    let scrollElement: HTMLElement;
    let itemsData: { video: Video }[];

    $: itemsData = QueueData.videos.map(video => ({ id: video.id, video: video }));
</script>

<div class="mx-4 2xl:mx-[7.5%] grid gap-8 grid-cols-2 h-[calc(100%-104px)]">
    <iframe
        class="w-full aspect-video"
        src="https://www.youtube.com/embed/?modestbranding=1&rel=0&controls=0&enablejsapi=1"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="YouTube Player"
    />
    <div class="overflow-y-scroll" bind:this={scrollElement}>
        <Grid
            gap={4}
            itemComponent={VideoCard}
            dragAxis='y'
            {scrollElement}
            {itemsData}
            {onDrop}
        />
    </div>
</div>
<script lang="ts">
    import IconPlayArrow from '~icons/material-symbols/play-arrow-rounded';
    import IconPlaylistAdd from '~icons/material-symbols/playlist-add-rounded';
    import IconMoreVert from '~icons/material-symbols/more-vert';
    import IconDragIndicator from '~icons/material-symbols/drag-indicator';
    
    export let item: any;

    let title: string;
    let authorName: string;
    let thumbnailUrl: string;

    $: idStore = item.video.idStore;
    $: getVideoData($idStore);

    async function getVideoData(id: string) {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
        const data = await res.json();

        if (res.ok) {
            title = data.title;
            authorName = data.author_name;
            thumbnailUrl = data.thumbnail_url;
        } else {
            throw new Error(data);
        }
    }
</script>

<div class="card card-compact card-side h-24 bg-base-300 shadow-xl">
    {#if title !== undefined}
        <figure><img class="aspect-video h-full" src={thumbnailUrl} alt="Video thumbnail" /></figure>
        <div class="card-body">
            <h2 class="card-title">{title}</h2>
            <p>{authorName}</p>
        </div>
    {/if}
    <div class="flex gap-4 self-center p-4">
        <button><IconPlayArrow /></button>
        <button><IconPlaylistAdd /></button>
        <button><IconMoreVert /></button>
        <div />
        <button class="drag-handle">
            <IconDragIndicator class="text-base-100" />
        </button>
    </div>
</div>
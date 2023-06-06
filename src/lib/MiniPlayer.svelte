<script lang="ts">
    import IconPlayCircle from '~icons/material-symbols/play-circle-rounded';
    import IconSkipNext from '~icons/material-symbols/skip-next-rounded';
    import IconSkipPrevious from '~icons/material-symbols/skip-previous-rounded';
    import IconVolumeUp from '~icons/material-symbols/volume-up-rounded';
    import IconRepeat from '~icons/material-symbols/repeat-rounded';
    import IconShuffle from '~icons/material-symbols/shuffle-rounded';
</script>

<div class="bottom-0 w-full bg-base-300 z-10">
    <div class="h-2">
        <progress class="progress align-top rounded-none" value="50" max="100"></progress>
    </div>
    <div class="navbar p-0">
        <div class="navbar-start flex">
            <div class="card card-compact card-side h-24">
                <div />
                <figure><img class="aspect-video h-full" src="https://via.placeholder.com/1280x720.png?text=16:9+Aspect+Ratio" alt="Placeholder"/></figure>
                <div />
            </div>
            <div class="card-body grow-0 p-4">
                <h2 class="card-title">{"Title"}</h2>
                <p>{"Author"}</p>
            </div>
        </div>
        <div class="navbar-center gap-4">
            <button><IconSkipPrevious /></button>
            <button><IconPlayCircle style="font-size: 2em" /></button>
            <button><IconSkipNext /></button>
        </div>
        <div class="navbar-end gap-4">
            <div class="flex p-4 space-x-4">
                <p class="p-4">0:00 / 0:00</p>
                <button><IconVolumeUp style="font-size: 0.8em" /></button>
                <button><IconRepeat style="font-size: 0.8em" /></button>
                <button><IconShuffle style="font-size: 0.8em" /></button>
            </div>
        </div>
    </div>
</div>
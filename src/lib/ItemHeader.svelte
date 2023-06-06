<script lang="ts">
    import type { Item } from '../lib/data';

    export let item: Item;

    $: nameStore = item.nameStore;
</script>

<style>
    .picture {
        border: 1px solid green;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
    }
</style>

<div class="my-4 bg-base-300">
    <div class="flex h-[164px] mx-4 2xl:mx-[15%] space-x-8">
        <figure><img class="aspect-video h-full" src="https://via.placeholder.com/1280x720.png?text=16:9+Aspect+Ratio" alt="Placeholder" /></figure>
        <div class="flex-col flex flex-grow py-4 space-y-4">
            <h1 class="text-6xl">{$nameStore}</h1>
            <div class="flex items-center space-x-4">
                <button class="btn btn-primary">Play</button>
                <button class="btn btn-primary">Add to Queue</button>
                <button class="btn btn-primary">Share</button>
                <div class="avatar-group -space-x-6">
                    <div class="avatar placeholder">
                        <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
                            <span>MX</span>
                        </div>
                    </div> 
                    <div class="avatar placeholder">
                        <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
                            <span>MX</span>
                        </div>
                    </div> 
                    <div class="avatar placeholder">
                        <div class="bg-neutral-focus text-neutral-content rounded-full w-12">
                            <span>MX</span>
                        </div>
                    </div> 
                    <div class="avatar placeholder">
                        <div class="w-12 bg-neutral-focus text-neutral-content">
                            <span>+99</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
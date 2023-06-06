<script lang="ts">
	import '../app.css';
	import Navbar from '../lib/Navbar.svelte';
	import MiniPlayer from '../lib/MiniPlayer.svelte';

	let scrollableBody: HTMLElement;
</script>

<div class="flex flex-col h-screen">
    <div class="grow overflow-y-auto" bind:this={scrollableBody}>
        <Navbar />
        <slot {scrollableBody} />
    </div>
    <MiniPlayer />
</div>
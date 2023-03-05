<script lang="ts">
    export let item: any;

    $: nameStore = item.playlist.nameStore;
</script>

<button class="card card-compact object-contain w-full bg-primary shadow-xl" on:click={item.onClick}>
    <figure><img src="https://via.placeholder.com/1280x720.png?text=16:9+Aspect+Ratio" alt="Placeholder" /></figure>
    <div class="card-body">
        <h1 class="card-title">{$nameStore}</h1>
    </div>
</button>
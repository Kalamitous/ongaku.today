<script lang="ts">
    export let item: any;

    $: nameStore = item.folder.nameStore;
</script>

<button class="card card-compact object-contain w-full bg-primary shadow-xl" on:click={item.onClick}>
    <div class="card-body">
        <h1 class="card-title">{$nameStore}</h1>
    </div>
</button>
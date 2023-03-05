<script lang="ts">
    import LibraryData from './data';
    import BreadcrumbButton from './BreadcrumbButton.svelte';

    export let id: string;

    function handleClick(id: string) {
        LibraryData.setCurItemId(id);
    }
    
    $: path = LibraryData.getItemPath(id);
</script>

<div class="breadcrumbs text-3xl">
    <ul>
        {#each path as item}
            <li>
                <BreadcrumbButton on:click={() => handleClick(item.id)} nameStore={item.nameStore} />
            </li>
        {/each}
    </ul>
</div>
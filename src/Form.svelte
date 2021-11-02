<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    import LayerConfigurations from "./LayerConfigurations.svelte";
    import {store} from './store.js';
    let project;

    store.subscribe(value => {
        project = value;
    });

    function updateProject() {
        store.update(value => {
            value = project;
            return value;
        });

        dispatch('updateCommand', {
            project: project,
        });
    }
</script>

<div class="p-12 w-full mx-auto space-x-4 pokemon">
    <div class="grid grid-cols-1 gap-6 w-full">
        <div class="grid grid-cols-1 gap-6">
            <label class="block">
                <span class="text-gray-700">NFT Collection name</span>
                <input type="text" class="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="Enter here the name of your NFT project" bind:value={project.name} on:keyup={updateProject}>
            </label>
            <label class="block">
                <span class="text-gray-700">Collection Description</span>
                <textarea class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder="Put here a brew description of the NFT project" bind:value={project.description} on:keyup={updateProject}></textarea>
            </label>
            <label class="block">
                <span class="text-gray-700">Put here your Author Name</span>
                <input type="text" class="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="Author" bind:value={project.author} on:keyup={updateProject} >
            </label>
            <label class="block">
                <span class="text-gray-700">Ipfs Url</span>
                <input type="text" class="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="ipfs://NewUriToReplace" bind:value={project.ipfs} on:keyup={updateProject} on:change={updateProject}>
            </label>
            <label class="block">
                <span class="text-gray-700">Image format:</span>
                <input type="number" class="
                            mt-1
                            w-24
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="width (pixels)" bind:value={project.width} on:keyup={updateProject} on:change={updateProject}> pixels x
                <input type="number" class="
                            mt-1
                            w-24
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="height (pixels)" bind:value={project.height} on:keyup={updateProject} on:change={updateProject}>pixels
            </label>
            <label class="inline-flex items-center pointer">
                <input type="checkbox" class="pointer" bind:checked={project.shuffle} on:change={updateProject}>
                <span class="ml-2">Shuffle the different items' editions (it can help to shuffle rare items with normal ones).</span>
            </label>
        </div>
        <LayerConfigurations on:updateCommand={updateProject} />
    </div>
</div>

<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    import {store} from './store.js';
    export let editionId;
    export let layerOrder;

    function removeLayerOrder() {
        dispatch('deleteLayerOrder', {
            key: layerOrder.layerOrderId
        });
    }

    function updateLayerOrder() {
        store.update(value => {
            const editionIndex = value.editions.findIndex(edition => edition.editionId === editionId);
            const layerOrderIndex = value.editions[editionIndex].layerOrders.findIndex(value => value.layerOrderId === layerOrder.layerOrderId);
            value.editions[editionIndex].layerOrders[layerOrderIndex] = layerOrder;
            console.log(value);
            dispatch('updateCommand', {
                project: value,
            });
            return value;
        });
    }

</script>

<div class="p-12 w-full h-full mx-auto bg-gray-50 rounded-xl shadow-md space-x-23">
    <div class="grid grid-cols-1 gap-6 w-full">
        <label class="block">
            <span class="text-gray-700">Folder Name:</span>
            <input type="text" class="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="Add here your folder layer name, try to avoid rare characters" bind:value={layerOrder.name} on:keyup={updateLayerOrder}>
        </label>
        <label class="block">
            <span class="text-gray-700">Display Name:</span>
            <input type="text" class="
                            mt-1
                            block
                            w-full
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="Add here the name you want to display it on the market (the Rarity flags)" bind:value={layerOrder.displayName} on:keyup={updateLayerOrder}>
        </label>
        <a on:click={removeLayerOrder} class="text-cyan-600 hover:text-cyan-700 delete">Remove Layer</a>
    </div>

</div>

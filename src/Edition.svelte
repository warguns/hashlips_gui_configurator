<script>
    import LayerOrder from "./LayerOrder.svelte";
    import { createEventDispatcher } from 'svelte';
    import {store} from './store.js';
    import { v4 as uuidv4 } from 'uuid';
    const dispatch = createEventDispatcher();
    export let edition;
    export let length;
    export let index;
    export let previousGrow;
    export let isLast;

    addLayerOrder();

    function addLayerOrder() {
        store.update(value => {
            edition.layerOrders.push({
                layerOrderId: uuidv4(),
                name: '',
                displayName: '',
            });
            const editionIndex = value.editions.findIndex(value => value.editionId === edition.editionId);
            value.editions[editionIndex] = edition;
            console.log(value);
            dispatch('updateCommand', {
                project: value,
            });
            return value;
        });
    }

    function handleMessage(event) {
        if(edition.layerOrders.length > 1) {
            console.log(event);
            store.update(value => {
                edition.layerOrders = edition.layerOrders.filter(layerOrder => (layerOrder.layerOrderId !== event.detail.key));
                const editionIndex = value.editions.findIndex(value => value.editionId === edition.editionId);
                value.editions[editionIndex] = edition;
                console.log(value);
                dispatch('updateCommand', {
                    project: value,
                });
                return value;
            });
        }
    }

    function removeEdition() {
        dispatch('delete', {
            key: edition.editionId
        });
    }
    function updateEdition() {
        store.update(value => {
            const editionIndex = value.editions.findIndex(ed => ed.editionId === edition.editionId);
            value.editions[editionIndex] = edition;
            dispatch('updateCommand', {
                project: value,
            });
            return value;
        });
    }
</script>
<div class="p-12 w-full bg-white rounded-xl shadow-md">
    <div class="grid grid-cols-1 gap-6">
        <label class="block">
            <span class="text-gray-700">{index > 0 ? 'Grow the size of items to:' : 'Create your First Edition with a total of:' }</span>
            <input  type="number" class="
                            grow
                            mt-1
                            w-24
                            rounded-md
                            border-gray-300
                            shadow-sm
                            focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
                          " placeholder="" min="{previousGrow}" disabled={!isLast} bind:value={edition.grow} on:keyup={updateEdition} on:change={updateEdition}> <span>{index > 0 ? 'with a new Edition' : 'items.' } </span>
        </label>
        <label class="block">
            <span class="text-gray-700">Add your different design layers ordered from the deepest (Background) to the nearest:</span>
        </label>
        {#each edition.layerOrders as layerOrder, i }
            <LayerOrder editionId="{edition.editionId}" layerOrder="{layerOrder}" on:deleteLayerOrder={handleMessage} on:updateCommand={updateEdition}/>
        {/each}

        <input type="button" name="addLayerOrder" class="pointer p-1 rounded-xl shadow-md" value="Add Layer" on:click={addLayerOrder}>
        <a  on:click={removeEdition}  class="text-cyan-600 hover:text-cyan-700 delete">Remove Edition</a>
    </div>
</div>

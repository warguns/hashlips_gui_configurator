<script>
    import Edition from "./Edition.svelte";
    import {store} from './store.js';
    import { v4 as uuidv4 } from 'uuid';
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    let editions;
    let project;

    store.subscribe(value => {
        project = value;
        editions = value.editions;
    });

    function addEdition() {
        store.update(value => {
            let last = editions[editions.length -1 ];
            const newUuid = uuidv4();
            editions.push({
                editionId: newUuid,
                grow: last.grow + 1,
                layerOrders: [
                ]
            });
            value.editions = editions;
            dispatch('updateCommand', {
                project: value,
            });
            console.log(value);
            return value;
        });
    }

    function handleMessage(event) {
        if (editions.length > 1) {
            store.update(value => {
                value.editions = editions.filter(edition => (edition.editionId !== event.detail.key));
                console.log(value);
                dispatch('updateCommand', {
                    project: value,
                });
                return value;
            });
        }
    }
    function updateProject() {
        store
        dispatch('updateCommand', {
            project: project,
        });
    }
</script>
<div class="w-full">
    <div class="grid grid-cols-1 gap-6 w-full">
        {#each editions as edition, i }
            <Edition index={i} edition={edition} length={editions.length} previousGrow={i > 0 ? editions[i - 1].grow + 1 : 1} isLast={i === editions.length - 1} on:delete={handleMessage} on:updateCommand={updateProject}/>
        {/each}
        <div class="w-full mx-auto flex items-center space-x-4">
            <div class="grid grid-cols-1 gap-6">
                <input type="button" class="pointer p-2 rounded-xl shadow-md w-full" name="addEdition" value="Add Edition" on:click={addEdition}>
            </div>
        </div>
    </div>
</div>

import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
export const defaultStore = {
    name: '',
    description: '',
    width: 512,
    height: 512,
    shuffle: false,
    ipfs: 'ipfs://NewUriToReplace',
    rarityDelimiter: '#',
    author: '',
    editions: [
        {
            editionId: uuidv4(),
            grow: 1,
            layerOrders: [
            ]
        }
    ],

};
export const store = writable(defaultStore);

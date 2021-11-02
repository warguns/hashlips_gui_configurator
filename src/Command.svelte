<script>
    import {v4 as uuidv4} from "uuid";
    import { defaultStore } from './store';
    import { afterUpdate } from 'svelte';

    afterUpdate(() => {
        hljs.highlightAll();
    });

    function copy() {
        navigator.clipboard.writeText(template);
        document.getElementById('copier').innerHTML = "Copied to your clipboard!";
        setTimeout(() => {
            document.getElementById('copier').innerHTML = "Copy Generated Config";
        }, 2000);
    }

    export let project = defaultStore;



    let template = '"use strict";\n' +
        '\n' +
        '\n' +
        'const path = require("path");\n' +
        'const isLocal = typeof process.pkg === "undefined";\n' +
        'const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);\n' +
        'const { MODE } = require(path.join(basePath, "constants/blend_mode.js"));\n' +
        'const { NETWORK } = require(path.join(basePath, "constants/network.js"));\n' +
        '\n' +
        'const network = NETWORK.eth;\n' +
        '\n' +
        '// General metadata for Ethereum\n' +
        'const namePrefix = ###NAME###;\n' +
        'const description = ###DESCRIPTION###;\n' +
        'const baseUri = ###IPFS###;\n' +
        '\n' +
        'const solanaMetadata = {\n' +
        '  symbol: "YC",\n' +
        '  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%\n' +
        '  external_url: "https://www.youtube.com/c/hashlipsnft",\n' +
        '  creators: [\n' +
        '    {\n' +
        '      address: "7fXNuer5sbZtaTEPhtJ5g5gNtuyRoKkvxdjEjEnPN4mC",\n' +
        '      share: 100,\n' +
        '    },\n' +
        '  ],\n' +
        '};\n' +
        '\n' +
        '// If you have selected Solana then the collection starts from 0 automatically\n' +
        'const layerConfigurations = ###LAYERCONFIG###;\n' +
        '\n' +
        'const debugLogs = false;\n' +
        'const shuffleLayerConfigurations = ###SHUFFLE###;\n' +
        '\n' +
        'const format = {\n' +
        '  width: ###WIDTH###,\n' +
        '  height: ###HEIGHT###,\n' +
        '};\n' +
        '\n' +
        'const gif = {\n' +
        '  export: false,\n' +
        '  repeat: 0,\n' +
        '  quality: 100,\n' +
        '  delay: 500,\n' +
        '};\n' +
        '\n' +
        'const text = {\n' +
        '  only: false,\n' +
        '  color: "#ffffff",\n' +
        '  size: 20,\n' +
        '  xGap: 40,\n' +
        '  yGap: 40,\n' +
        '  align: "left",\n' +
        '  baseline: "top",\n' +
        '  weight: "regular",\n' +
        '  family: "Courier",\n' +
        '  spacer: " => ",\n' +
        '};\n' +
        '\n' +
        'const pixelFormat = {\n' +
        '  ratio: 2 / 128,\n' +
        '};\n' +
        '\n' +
        'const background = {\n' +
        '  generate: true,\n' +
        '  brightness: "80%",\n' +
        '  static: false,\n' +
        '  default: "#000000",\n' +
        '};\n' +
        '\n' +
        'const extraMetadata = { author: ###AUTHOR###};\n' +
        '\n' +
        'const rarityDelimiter = "#";\n' +
        '\n' +
        'const uniqueDnaTorrance = 10000;\n' +
        '\n' +
        'const preview = {\n' +
        '  thumbPerRow: 5,\n' +
        '  thumbWidth: 50,\n' +
        '  imageRatio: format.height / format.width,\n' +
        '  imageName: "preview.png",\n' +
        '};\n' +
        '\n' +
        'const preview_gif = {\n' +
        '  numberOfImages: 5,\n' +
        '  order: "ASC", // ASC, DESC, MIXED\n' +
        '  repeat: 0,\n' +
        '  quality: 100,\n' +
        '  delay: 500,\n' +
        '  imageName: "preview.gif",\n' +
        '};\n' +
        '\n' +
        'module.exports = {\n' +
        '  format,\n' +
        '  baseUri,\n' +
        '  description,\n' +
        '  background,\n' +
        '  uniqueDnaTorrance,\n' +
        '  layerConfigurations,\n' +
        '  rarityDelimiter,\n' +
        '  preview,\n' +
        '  shuffleLayerConfigurations,\n' +
        '  debugLogs,\n' +
        '  extraMetadata,\n' +
        '  pixelFormat,\n' +
        '  text,\n' +
        '  namePrefix,\n' +
        '  network,\n' +
        '  solanaMetadata,\n' +
        '  gif,\n' +
        '  preview_gif,\n' +
        '};\n';

    function transformEdition(editions) {

        let layerConfigurations = [];
        editions.forEach(edition => {
            console.log(edition);
            let layersOrder = [];
            edition.layerOrders.forEach(layerOrder => {
               layersOrder.push({
                   name: layerOrder.name,
                   options: {
                       displayName: layerOrder.displayName,
                   }
               })
            });

            layerConfigurations.push({
                growEditionSizeTo: edition.grow,
                layersOrder: layersOrder
            });
        })

        return layerConfigurations;
    }

    template = template.replace("###NAME###", JSON.stringify(project.name));
    template = template.replace("###DESCRIPTION###", JSON.stringify(project.description));
    template = template.replace("###WIDTH###", project.width);
    template = template.replace("###HEIGHT###", project.height);
    template = template.replace("###SHUFFLE###", project.shuffle);
    template = template.replace("###AUTHOR###", JSON.stringify(project.author));
    template = template.replace("###IPFS###", JSON.stringify(project.ipfs));
    template = template.replace("###LAYERCONFIG###", JSON.stringify(transformEdition(project.editions)));

</script>

<div class="p-12 w-full mx-auto space-x-4">
    <div class="grid grid-cols-1 gap-6 w-full">
        <div class="grid grid-cols-1 gap-6">
            <a id="copier" on:click={copy} class=" text-right pointer w-1/2 flex rounded-md border border-gray-300">Copy Generated Config</a>
            <label class="block">
                <span class="text-gray-700">Generated Config:</span>
                <pre class=""><code id="command" class="language-javascript rounded-xl">{template}</code></pre>
            </label>
        </div>
    </div>
</div>


<script>
	import Form from './Form.svelte';
	import Command from './Command.svelte';
	export let name;

	let project;

	function handleMessage(event) {
		project = event.detail.project;

	}
</script>

<main>
	<div class="grid grid-cols-1 place-items-center">
		<img src="logo.png" width="200" />
		<h1>Config Editor Gui</h1>
		<h5 class="text-xs">alpha version 0.1</h5>
	</div>

	<div class="grid grid-cols-2">
		<div class="space-x-4">
			<Form on:updateCommand={handleMessage} />
		</div>
		<div class="space-x-4">
			{#key project}
				<Command project={project}/>
			{/key}
		</div>
	</div>

</main>

<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	body {
		background-color: #d3d6f1;
	}
	h1, #copier {
		color: #f1499e;
	}

	a, .pointer {
		cursor: pointer;
	}

	.delete {
		color: #a44848;
	}


</style>

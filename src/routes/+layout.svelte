<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Waybar Modules Marketplace</title>
</svelte:head>

{@render children()}

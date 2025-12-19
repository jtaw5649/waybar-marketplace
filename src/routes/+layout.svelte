<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<svelte:head>
	<title>Waybar Modules Marketplace</title>
</svelte:head>

{@render children()}

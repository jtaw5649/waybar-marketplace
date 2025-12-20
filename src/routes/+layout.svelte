<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { toggle } from '$lib/stores/commandPalette';
	import { stars } from '$lib/stores/stars';
	import { page } from '$app/stores';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		const session = $page.data.session;
		stars.setAuthenticated(!!session?.user);
	});

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Waybar Marketplace</title>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>
<div class="app-wrapper">
	{@render children()}
</div>
<Toast />
<CommandPalette />

<style>
	.app-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-wrapper :global(main) {
		flex: 1;
	}

	.app-wrapper :global(footer) {
		margin-top: auto;
	}
</style>

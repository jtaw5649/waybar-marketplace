<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { toggle } from '$lib/stores/commandPalette';
	import { stars } from '$lib/stores/stars.svelte';
	import { notificationSSE } from '$lib/stores/notificationSSE.svelte';
	import { page } from '$app/state';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		const session = page.data.session;
		stars.setAuthenticated(!!session?.user);
		if (session?.user) {
			notificationSSE.connect();
		} else {
			notificationSSE.disconnect();
		}
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
	<title>Barforge</title>
</svelte:head>

<a href="#main-content" class="skip-link">Skip to main content</a>
<div class="app-wrapper">
	{@render children()}
</div>
<BackToTop />
<Toast />
<CommandPalette session={page.data.session} isAdmin={page.data.isAdmin} />

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

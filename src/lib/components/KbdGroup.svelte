<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div data-slot="kbd-group" class="kbd-group {className}">
	{@render children()}
</div>

<style>
	.kbd-group {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}
</style>

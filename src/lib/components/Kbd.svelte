<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		variant?: 'default' | 'ghost';
	}

	let { class: className = '', variant = 'default', children }: Props = $props();
</script>

<kbd data-slot="kbd" class="kbd {className}" class:ghost={variant === 'ghost'}>
	{@render children()}
</kbd>

<style>
	.kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 var(--space-xs);
		background-color: transparent;
		color: var(--color-text-faint);
		border: 1px solid var(--color-border);
		border-radius: 0;
		font-size: 0.75rem;
		font-family: var(--font-mono);
		line-height: 1;
		pointer-events: none;
		user-select: none;
	}

	.kbd.ghost {
		background-color: transparent;
		border-color: transparent;
	}
</style>

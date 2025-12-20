<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { untrack } from 'svelte';

	interface Props {
		title: string;
		count?: number;
		initialExpanded?: boolean;
		actions?: Snippet;
		children: Snippet;
	}

	let { title, count, initialExpanded = true, actions, children }: Props = $props();

	let expanded = $state(untrack(() => initialExpanded));
</script>

<section class="collapsible-section">
	<div class="section-header-wrapper">
		<button class="section-header" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
			<h2>
				{title}{#if count !== undefined}
					<span class="count">({count})</span>{/if}
			</h2>
			<svg
				class="chevron"
				class:rotated={!expanded}
				viewBox="0 0 24 24"
				width="20"
				height="20"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<polyline points="6 9 12 15 18 9" />
			</svg>
		</button>
		{#if actions}
			<div class="section-actions">
				{@render actions()}
			</div>
		{/if}
	</div>

	{#if expanded}
		<div class="section-content" transition:slide={{ duration: 200 }}>
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.collapsible-section {
		margin-bottom: var(--space-xl);
	}

	.section-header-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1;
		padding: var(--space-sm) 0;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.section-actions {
		flex-shrink: 0;
	}

	.section-header h2 {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-normal);
		margin: 0;
	}

	.count {
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.chevron {
		color: var(--color-text-muted);
		transition: transform var(--duration-normal) var(--ease-out);
		flex-shrink: 0;
	}

	.chevron.rotated {
		transform: rotate(-90deg);
	}

	.section-header:hover .chevron {
		color: var(--color-text-normal);
	}

	.section-header:focus-visible {
		outline: none;
		border-radius: var(--radius-sm);
		box-shadow: var(--focus-ring);
	}

	.section-content {
		padding-top: var(--space-md);
	}

	@media (prefers-reduced-motion: reduce) {
		.chevron {
			transition: none;
		}
	}
</style>

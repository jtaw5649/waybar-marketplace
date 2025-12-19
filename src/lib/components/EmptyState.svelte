<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: Snippet;
		action?: Snippet;
	}

	let { title, description, icon, action }: Props = $props();
</script>

<div class="empty-state">
	{#if icon}
		<div class="empty-icon">
			{@render icon()}
		</div>
	{/if}
	<h2>{title}</h2>
	{#if description}
		<p>{description}</p>
	{/if}
	{#if action}
		<div class="empty-action">
			{@render action()}
		</div>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-3xl);
		text-align: center;
		color: var(--color-text-muted);
	}

	.empty-icon {
		margin-bottom: var(--space-lg);
		opacity: 0.5;
	}

	.empty-icon :global(svg) {
		width: 48px;
		height: 48px;
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-normal);
		margin-bottom: var(--space-sm);
	}

	p {
		margin-bottom: var(--space-lg);
		max-width: 400px;
		line-height: 1.5;
	}

	.empty-action {
		margin-top: var(--space-sm);
	}
</style>

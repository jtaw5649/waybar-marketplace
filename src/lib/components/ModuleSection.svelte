<script lang="ts">
	import type { Module } from '$lib/types';
	import ModuleCard from './ModuleCard.svelte';

	interface Props {
		title: string;
		subtitle: string;
		modules: Module[];
		seeAllUrl?: string;
	}

	let { title, subtitle, modules, seeAllUrl }: Props = $props();
</script>

<section class="home-section">
	<div class="section-header">
		<div>
			<h2>{title}</h2>
			<p>{subtitle}</p>
		</div>
		{#if seeAllUrl}
			<a href={seeAllUrl} class="see-all">See all &rarr;</a>
		{/if}
	</div>
	<div class="module-container grid">
		{#each modules as module (module.uuid)}
			<ModuleCard
				uuid={module.uuid}
				name={module.name}
				description={module.description}
				author={module.author}
				category={module.category}
				downloads={module.downloads}
			/>
		{/each}
	</div>
</section>

<style>
	.home-section {
		position: relative;
		overflow: hidden;
		border-radius: 1.25rem;
		border: 2px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		background: color-mix(in srgb, var(--color-bg-base) 40%, transparent);
		backdrop-filter: blur(12px);
		margin: var(--space-2xl) auto 0;
		padding: var(--space-2xl);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
		transition: all 0.3s ease;
	}

	.home-section::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 10%, transparent),
			transparent 50%,
			color-mix(in srgb, var(--color-primary) 5%, transparent)
		);
		opacity: 0.5;
		pointer-events: none;
	}

	.home-section:hover {
		border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
		box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
	}

	.section-header {
		position: relative;
		z-index: 1;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.section-header h2 {
		font-size: 1.75rem;
		font-weight: 700;
		background: linear-gradient(
			135deg,
			var(--color-text-normal),
			color-mix(in srgb, var(--color-text-normal) 70%, transparent)
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.section-header p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-top: var(--space-xs);
		max-width: 32rem;
	}

	.see-all {
		position: relative;
		z-index: 1;
		color: var(--color-text-muted);
		font-size: 0.8125rem;
		text-decoration: none;
		font-weight: 600;
		padding: 8px 16px;
		border-radius: 999px;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		transition:
			color var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out);
	}

	.see-all:hover {
		color: var(--color-text-normal);
		background: var(--color-bg-surface);
	}

	.module-container {
		position: relative;
		z-index: 1;
	}

	.module-container.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--space-xl);
	}

	.home-section :global(.description) {
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}

	.home-section :global(.favorite-action),
	.home-section :global(.row-favorite) {
		display: none;
	}

	.home-section :global(.card-footer) {
		margin-top: var(--space-sm);
		padding-top: var(--space-xs);
		border-top: none;
	}

	.home-section :global(.card-stats) {
		background: transparent;
		border: none;
		padding: 0;
		font-size: 0.7rem;
		color: var(--color-text-faint);
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const tabs = [
		{ href: '/modules', label: 'Discover' },
		{ href: '/modules/search', label: 'Search' }
	] as const;

	function isActive(href: string): boolean {
		if (href === '/modules') {
			return page.url.pathname === '/modules';
		}
		return page.url.pathname.startsWith('/modules/search');
	}
</script>

<Header session={data.session} />

<div class="browse-tab-bar">
	<nav class="browse-tabs" aria-label="Browse navigation">
		{#each tabs as tab (tab.href)}
			<a
				href={tab.href}
				class="browse-tab"
				class:active={isActive(tab.href)}
				aria-current={isActive(tab.href) ? 'page' : undefined}
			>
				{tab.label}
			</a>
		{/each}
	</nav>
</div>

<main class="browse-page" id="main-content">
	{@render children()}
</main>

<Footer />

<style>
	.browse-tab-bar {
		position: sticky;
		top: 4rem;
		z-index: 50;
		display: flex;
		justify-content: center;
		padding: var(--space-md) var(--space-lg);
		background: var(--color-bg-surface);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
	}

	.browse-tabs {
		display: flex;
		gap: var(--space-xs);
		padding: 4px;
		background: var(--color-bg-elevated);
		border-radius: 999px;
		border: 1px solid var(--color-border);
	}

	.browse-tab {
		padding: 8px 20px;
		border-radius: 999px;
		font-weight: 500;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-decoration: none;
		transition:
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.browse-tab:hover {
		color: var(--color-text-normal);
	}

	.browse-tab.active {
		background: var(--color-primary);
		color: white;
		box-shadow: 0 2px 8px rgba(111, 125, 255, 0.3);
	}

	.browse-page {
		flex: 1;
		background-color: var(--color-bg-base);
		padding-top: var(--space-lg);
	}

	@media (max-width: 768px) {
		.browse-tab-bar {
			top: 3.5rem;
			padding: var(--space-sm) var(--space-md);
		}

		.browse-tab {
			padding: 6px 16px;
			font-size: 0.8125rem;
		}
	}
</style>

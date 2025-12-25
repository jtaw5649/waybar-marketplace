<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const sections = [
		{ slug: 'profile', label: 'Profile', icon: 'user' },
		{ slug: 'notifications', label: 'Notifications', icon: 'bell' },
		{ slug: 'security', label: 'Security', icon: 'shield' }
	] as const;

	function isActive(slug: string): boolean {
		return (
			page.url.pathname === `/settings/${slug}` ||
			(page.url.pathname === `/settings` && slug === 'profile')
		);
	}
</script>

<Header session={data.session} />

<main class="settings-page" id="main-content">
	<div class="settings-container">
		<aside class="settings-sidebar">
			<h1 class="settings-title">Settings</h1>
			<nav class="settings-nav" aria-label="Settings navigation">
				{#each sections as section (section.slug)}
					<a
						href="/settings/{section.slug}"
						class="nav-link"
						class:active={isActive(section.slug)}
						aria-current={isActive(section.slug) ? 'page' : undefined}
					>
						{#if section.icon === 'user'}
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
						{:else if section.icon === 'bell'}
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
								<path d="M13.73 21a2 2 0 0 1-3.46 0" />
							</svg>
						{:else if section.icon === 'shield'}
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
							</svg>
						{/if}
						{section.label}
					</a>
				{/each}
			</nav>

			<a href="/dashboard" class="back-link">
				<svg
					viewBox="0 0 24 24"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M19 12H5M12 19l-7-7 7-7" />
				</svg>
				Back to Dashboard
			</a>
		</aside>

		<section class="settings-content">
			{@render children()}
		</section>
	</div>
</main>

<Footer />

<style>
	.settings-page {
		flex: 1;
		background-color: var(--color-bg-base);
		padding-top: 5rem;
	}

	.settings-container {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: var(--space-xl);
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-lg);
		min-height: calc(100vh - 160px);
	}

	.settings-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.settings-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-normal);
		margin: 0 0 var(--space-md) 0;
	}

	.settings-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.nav-link:hover {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
	}

	.nav-link.active {
		background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
		color: var(--color-primary);
	}

	.nav-link svg {
		flex-shrink: 0;
	}

	.back-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-top: auto;
		padding: var(--space-sm) var(--space-md);
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--font-size-sm);
		border-radius: var(--radius-md);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.back-link:hover {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
	}

	.settings-content {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		min-height: 400px;
	}

	@media (max-width: 768px) {
		.settings-container {
			grid-template-columns: 1fr;
			gap: var(--space-lg);
			padding: var(--space-lg) var(--space-md);
		}

		.settings-sidebar {
			flex-direction: column;
		}

		.settings-nav {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.nav-link {
			flex: 1;
			min-width: fit-content;
			justify-content: center;
		}

		.back-link {
			margin-top: var(--space-md);
			justify-content: center;
		}
	}
</style>

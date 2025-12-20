<script lang="ts">
	import { fly } from 'svelte/transition';
	import { stars } from '$lib/stores/stars';
	import { get } from 'svelte/store';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import ModuleCardRow from '$lib/components/ModuleCardRow.svelte';
	import Button from '$lib/components/Button.svelte';
	import { viewMode, type ViewMode } from '$lib/stores/viewMode';

	let { data } = $props();

	let starsState = $state(get(stars));
	let currentViewMode = $state<ViewMode>('grid');

	$effect(() => {
		return viewMode.subscribe((value) => {
			currentViewMode = value;
		});
	});

	$effect(() => {
		return stars.subscribe((s) => {
			starsState = s;
		});
	});

	const localStarredUuids = $derived([...starsState.starred]);
	const serverModules = $derived(data.starredModules);

	const displayModules = $derived(() => {
		if (data.isAuthenticated) {
			return serverModules.filter((m) => starsState.starred.has(m.uuid));
		}
		return serverModules.filter((m) => localStarredUuids.includes(m.uuid));
	});

	const localOnlyCount = $derived(
		localStarredUuids.filter((uuid) => !serverModules.some((m) => m.uuid === uuid)).length
	);
</script>

<svelte:head>
	<title>Your Stars - Waybar Marketplace</title>
	<meta name="description" content="Your starred Waybar modules" />
</svelte:head>

<Header session={data.session} />

<main id="main-content">
	<div class="container">
		<div class="page-header" in:fly={{ y: -20, duration: 300 }}>
			<div class="header-content">
				<div class="title-section">
					<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/>
					</svg>
					<h1>Your Stars</h1>
				</div>
				<p class="subtitle">
					{#if data.isAuthenticated}
						{displayModules().length} starred module{displayModules().length !== 1 ? 's' : ''}
						{#if localOnlyCount > 0}
							<span class="sync-note">({localOnlyCount} syncing...)</span>
						{/if}
					{:else}
						{localStarredUuids.length} starred locally
					{/if}
				</p>
			</div>

			{#if !data.isAuthenticated}
				<div class="auth-prompt">
					<p>Sign in to sync your stars across devices</p>
					<Button href="/login?redirectTo=/stars" variant="primary" size="sm">Sign In</Button>
				</div>
			{/if}
		</div>

		{#if displayModules().length > 0}
			<div class="module-container" class:grid={currentViewMode === 'grid'} class:list={currentViewMode === 'list'}>
				{#each displayModules() as module, i (module.uuid)}
					{#if currentViewMode === 'grid'}
						<ModuleCard
							uuid={module.uuid}
							name={module.name}
							author={module.author_username}
							description={module.description}
							category={module.category}
							downloads={module.downloads}
							version={module.version}
							verified={module.verified}
							icon={module.icon_url}
							createdAt={module.created_at}
							delay={i * 50}
						/>
					{:else}
						<ModuleCardRow
							uuid={module.uuid}
							name={module.name}
							author={module.author_username}
							description={module.description}
							category={module.category}
							downloads={module.downloads}
							version={module.version}
							verified={module.verified}
							icon={module.icon_url}
							createdAt={module.created_at}
							delay={i * 30}
						/>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="empty-state" in:fly={{ y: 20, duration: 300, delay: 150 }}>
				<div class="empty-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/>
					</svg>
				</div>
				<h2>No starred modules yet</h2>
				<p>Star modules while browsing to quickly access them later</p>
				<Button href="/browse" variant="primary">Browse Modules</Button>
			</div>
		{/if}
	</div>
</main>

<Footer />

<style>
	main {
		flex: 1;
		padding: var(--space-2xl) 0;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--space-2xl);
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-xl);
		margin-bottom: var(--space-2xl);
		flex-wrap: wrap;
	}

	.header-content {
		flex: 1;
	}

	.title-section {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xs);
	}

	.star-icon {
		width: 32px;
		height: 32px;
		color: var(--color-warning);
	}

	h1 {
		font-size: 2rem;
		font-weight: 700;
	}

	.subtitle {
		color: var(--color-text-muted);
		font-size: 1rem;
	}

	.sync-note {
		color: var(--color-text-faint);
		font-style: italic;
	}

	.auth-prompt {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.auth-prompt p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin: 0;
	}

	.module-container.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: var(--space-lg);
	}

	.module-container.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-4xl) var(--space-xl);
		background: var(--color-bg-surface);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
	}

	.empty-icon {
		width: 64px;
		height: 64px;
		margin-bottom: var(--space-lg);
		color: var(--color-text-faint);
	}

	.empty-icon svg {
		width: 100%;
		height: 100%;
	}

	.empty-state h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--space-sm);
	}

	.empty-state p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-lg);
	}

	@media (max-width: 768px) {
		.container {
			padding: 0 var(--space-lg);
		}

		.page-header {
			flex-direction: column;
		}

		.auth-prompt {
			width: 100%;
			flex-direction: column;
			text-align: center;
		}

		.module-container.grid {
			grid-template-columns: 1fr;
		}
	}
</style>

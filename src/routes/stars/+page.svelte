<script lang="ts">
	import { fly } from 'svelte/transition';
	import { fromStore } from 'svelte/store';
	import { onMount } from 'svelte';
	import { Star } from 'lucide-svelte';
	import { stars } from '$lib/stores/stars.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import ModuleCardRow from '$lib/components/ModuleCardRow.svelte';
	import Button from '$lib/components/Button.svelte';
	import { viewMode } from '$lib/stores/viewMode';
	import { encodeModuleUuid } from '$lib/utils/url';

	interface ModuleInfo {
		uuid: string;
		name: string;
		description: string;
		category: string;
		downloads: number;
		version?: string;
		verified: boolean;
		icon_url?: string;
		author_username: string;
		created_at: string;
	}

	let { data } = $props();

	const viewModeState = fromStore(viewMode);

	const localStarredUuids = $derived([...stars.starred]);
	const serverModules = $derived(data.starredModules);

	let localModules = $state<ModuleInfo[]>([]);
	let loadingLocal = $state(false);

	async function fetchLocalStarredModules() {
		if (data.isAuthenticated || localStarredUuids.length === 0) return;

		loadingLocal = true;
		const fetched: ModuleInfo[] = [];

		await Promise.all(
			localStarredUuids.map(async (uuid) => {
				try {
					const res = await fetch(`/api/modules/${encodeModuleUuid(uuid)}`);
					if (res.ok) {
						const module = await res.json();
						fetched.push(module);
					}
				} catch {
					// Skip failed fetches
				}
			})
		);

		localModules = fetched;
		loadingLocal = false;
	}

	onMount(() => {
		if (!data.isAuthenticated && localStarredUuids.length > 0) {
			fetchLocalStarredModules();
		}
	});

	const displayModules = $derived(() => {
		if (data.isAuthenticated) {
			return serverModules.filter((m) => stars.starred.has(m.uuid));
		}
		return localModules.filter((m) => stars.starred.has(m.uuid));
	});

	const localOnlyCount = $derived(
		localStarredUuids.filter((uuid) => !serverModules.some((m) => m.uuid === uuid)).length
	);
</script>

<svelte:head>
	<title>Your Stars - Barforge</title>
	<meta name="description" content="Your starred Barforge modules" />
</svelte:head>

<Header session={data.session} />

<main id="main-content">
	<div class="container">
		<div class="page-header" in:fly={{ y: -20, duration: 300 }}>
			<div class="header-content">
				<div class="title-section">
					<span class="star-icon"><Star size={32} /></span>
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
					<p>Log in to sync your stars across devices</p>
					<Button href="/login?redirectTo=/stars" variant="primary" size="sm">Log In</Button>
				</div>
			{/if}
		</div>

		{#if loadingLocal}
			<div class="loading-state" in:fly={{ y: 20, duration: 300 }}>
				<div class="spinner"></div>
				<p>Loading your starred modules...</p>
			</div>
		{:else if displayModules().length > 0}
			<div
				class="module-container"
				class:grid={viewModeState.current === 'grid'}
				class:list={viewModeState.current === 'list'}
			>
				{#each displayModules() as module, i (module.uuid)}
					{#if viewModeState.current === 'grid'}
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
					<Star size={64} />
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
		padding-top: 5rem;
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
		display: inline-flex;
		color: var(--color-warning);
	}

	.star-icon :global(svg) {
		fill: currentColor;
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

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-4xl) var(--space-xl);
		gap: var(--space-lg);
	}

	.loading-state p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
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
		margin-bottom: var(--space-lg);
		color: var(--color-text-faint);
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

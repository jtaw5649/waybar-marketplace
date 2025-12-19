<script lang="ts">
	import { API_BASE_URL } from '$lib';

	interface Module {
		uuid: string;
		name: string;
		author: string;
		description: string;
		category: string;
		downloads: number;
		rating: number | null;
	}

	let modules: Module[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	$effect(() => {
		fetchModules();
	});

	async function fetchModules() {
		try {
			const res = await fetch(`${API_BASE_URL}/api/v1/index`);
			if (!res.ok) throw new Error('Failed to fetch modules');
			const data = await res.json();
			modules = data.modules || [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function formatDownloads(n: number): string {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return n.toString();
	}
</script>

<main>
	<header>
		<h1>Browse Modules</h1>
		<p>Discover community-created modules for Waybar</p>
	</header>

	<section class="content">
		{#if loading}
			<div class="loading">Loading modules...</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if modules.length === 0}
			<div class="empty">No modules found</div>
		{:else}
			<div class="grid">
				{#each modules as module}
					<a href="/modules/{module.uuid}" class="card">
						<h3>{module.name}</h3>
						<p class="author">by {module.author}</p>
						<p class="description">{module.description}</p>
						<div class="meta">
							<span class="category">{module.category}</span>
							<span class="downloads">{formatDownloads(module.downloads)} downloads</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	main {
		min-height: 100vh;
	}

	header {
		padding: var(--space-xl) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
	}

	header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	header p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.content {
		padding: var(--space-2xl);
	}

	.loading,
	.error,
	.empty {
		text-align: center;
		padding: var(--space-2xl);
		color: var(--color-text-muted);
	}

	.error {
		color: var(--color-error);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-lg);
	}

	.card {
		display: block;
		padding: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: inherit;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.card:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-elevated);
		text-decoration: none;
	}

	.card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.card .author {
		font-size: 0.75rem;
		color: var(--color-text-faint);
		margin-bottom: var(--space-md);
	}

	.card .description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card .meta {
		display: flex;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.category {
		background-color: var(--color-bg-base);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}
</style>

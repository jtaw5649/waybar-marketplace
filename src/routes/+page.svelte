<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface Module {
		uuid: string;
		name: string;
		author: string;
		description: string;
		category: string;
		downloads: number;
		rating: number | null;
		verified_author: boolean;
	}

	interface FeaturedData {
		featured: Module[];
		popular: Module[];
		recent: Module[];
	}

	let featuredData: FeaturedData | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);

	$effect(() => {
		fetchFeatured();
	});

	async function fetchFeatured() {
		try {
			const res = await fetch(`${API_BASE_URL}/api/v1/featured`);
			if (!res.ok) throw new Error('Failed to fetch featured modules');
			const json = await res.json();
			featuredData = json;
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
		<a href="/" class="logo">Waybar Modules</a>
		<nav>
			<a href="/browse">Browse</a>
		</nav>
		<div class="header-right">
			{#if data.session?.user}
				<a href="/upload" class="btn btn-small">Upload</a>
				<a href="/dashboard" class="user-link">
					<img src={data.session.user.image} alt="" class="avatar" />
					<span class="user-name">{data.session.user.name}</span>
				</a>
				<button class="btn btn-small" onclick={() => signOut()}>Sign Out</button>
			{:else}
				<a href="/login" class="btn btn-small btn-primary">Sign In</a>
			{/if}
		</div>
	</header>

	<section class="hero">
		<div class="hero-content">
			<h1>Discover modules for your Waybar</h1>
			<p>
				Find community-created modules to enhance your Waybar experience.
				Install with a single click using Waybar Manager.
			</p>
			<div class="hero-actions">
				<a href="/browse" class="btn btn-primary btn-large">Browse Modules</a>
				{#if data.session?.user}
					<a href="/upload" class="btn btn-secondary btn-large">Upload Module</a>
				{:else}
					<a href="/login" class="btn btn-secondary btn-large">Sign In to Upload</a>
				{/if}
			</div>
		</div>
	</section>

	{#if loading}
		<section class="modules-section">
			<div class="loading">Loading modules...</div>
		</section>
	{:else if error}
		<section class="modules-section">
			<div class="error">{error}</div>
		</section>
	{:else if featuredData}
		{#if featuredData.featured.length > 0}
			<section class="modules-section">
				<div class="section-header">
					<h2>Featured Modules</h2>
					<p>Hand-picked by our team</p>
				</div>
				<div class="grid featured-grid">
					{#each featuredData.featured as module}
						<a href="/modules/{encodeURIComponent(module.uuid)}" class="card featured-card">
							<div class="card-header">
								<h3>{module.name}</h3>
								{#if module.verified_author}
									<span class="verified" title="Verified Author">&#10003;</span>
								{/if}
							</div>
							<p class="author">by {module.author}</p>
							<p class="description">{module.description}</p>
							<div class="meta">
								<span class="category">{module.category}</span>
								<span class="downloads">{formatDownloads(module.downloads)} downloads</span>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if featuredData.popular.length > 0}
			<section class="modules-section">
				<div class="section-header">
					<h2>Popular Modules</h2>
					<a href="/browse?sort=popular" class="see-all">See all</a>
				</div>
				<div class="grid">
					{#each featuredData.popular as module}
						<a href="/modules/{encodeURIComponent(module.uuid)}" class="card">
							<div class="card-header">
								<h3>{module.name}</h3>
								{#if module.verified_author}
									<span class="verified" title="Verified Author">&#10003;</span>
								{/if}
							</div>
							<p class="author">by {module.author}</p>
							<p class="description">{module.description}</p>
							<div class="meta">
								<span class="category">{module.category}</span>
								<span class="downloads">{formatDownloads(module.downloads)} downloads</span>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if featuredData.recent.length > 0}
			<section class="modules-section">
				<div class="section-header">
					<h2>Recently Added</h2>
					<a href="/browse?sort=recent" class="see-all">See all</a>
				</div>
				<div class="grid">
					{#each featuredData.recent as module}
						<a href="/modules/{encodeURIComponent(module.uuid)}" class="card">
							<div class="card-header">
								<h3>{module.name}</h3>
								{#if module.verified_author}
									<span class="verified" title="Verified Author">&#10003;</span>
								{/if}
							</div>
							<p class="author">by {module.author}</p>
							<p class="description">{module.description}</p>
							<div class="meta">
								<span class="category">{module.category}</span>
								<span class="downloads">{formatDownloads(module.downloads)} downloads</span>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}

	header {
		padding: var(--space-md) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		background-color: var(--color-bg-base);
		z-index: 100;
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-normal);
		text-decoration: none;
	}

	nav {
		display: flex;
		gap: var(--space-lg);
	}

	nav a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: 0.875rem;
	}

	nav a:hover {
		color: var(--color-text-normal);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.user-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		text-decoration: none;
		color: inherit;
	}

	.user-link:hover .user-name {
		color: var(--color-text-normal);
	}

	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
	}

	.user-name {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.btn-small {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-normal);
	}

	.btn-small:hover {
		background-color: var(--color-bg-elevated);
		text-decoration: none;
	}

	.btn-small.btn-primary {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.hero {
		padding: var(--space-3xl) var(--space-2xl);
		text-align: center;
		background: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%);
		border-bottom: 1px solid var(--color-border);
	}

	.hero-content {
		max-width: 700px;
		margin: 0 auto;
	}

	.hero-content h1 {
		font-size: 2.75rem;
		font-weight: 700;
		margin-bottom: var(--space-lg);
		line-height: 1.2;
	}

	.hero-content p {
		color: var(--color-text-muted);
		font-size: 1.25rem;
		margin-bottom: var(--space-xl);
		line-height: 1.6;
	}

	.hero-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	.btn {
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.15s ease;
		text-decoration: none;
	}

	.btn-large {
		padding: var(--space-lg) var(--space-2xl);
		font-size: 1.125rem;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: #4f6ce8;
		text-decoration: none;
	}

	.btn-secondary {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-elevated);
		text-decoration: none;
	}

	.modules-section {
		padding: var(--space-2xl);
		max-width: 1400px;
		margin: 0 auto;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: var(--space-lg);
	}

	.section-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.section-header p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-top: var(--space-xs);
	}

	.see-all {
		color: var(--color-primary);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.see-all:hover {
		text-decoration: underline;
	}

	.loading,
	.error {
		text-align: center;
		padding: var(--space-2xl);
		color: var(--color-text-muted);
	}

	.error {
		color: var(--color-error);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-lg);
	}

	.featured-grid {
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

	.featured-card {
		background: linear-gradient(135deg, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%);
		border-color: var(--color-primary);
		border-width: 2px;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-xs);
	}

	.card h3 {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.verified {
		color: var(--color-primary);
		font-size: 0.875rem;
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
		line-height: 1.5;
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

	@media (max-width: 768px) {
		header {
			padding: var(--space-md) var(--space-lg);
		}

		nav {
			display: none;
		}

		.hero {
			padding: var(--space-2xl) var(--space-lg);
		}

		.hero-content h1 {
			font-size: 2rem;
		}

		.hero-content p {
			font-size: 1rem;
		}

		.hero-actions {
			flex-direction: column;
		}

		.modules-section {
			padding: var(--space-lg);
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>

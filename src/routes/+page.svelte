<script lang="ts">
	import type { PageData } from './$types';
	import { fromStore } from 'svelte/store';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import ModuleCardRow from '$lib/components/ModuleCardRow.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { getHomepageCategories } from '$lib/constants/categories';
	import { recentlyViewed } from '$lib/stores/recentlyViewed';
	import { viewMode } from '$lib/stores/viewMode';

	let { data }: { data: PageData } = $props();

	const categories = getHomepageCategories();

	const viewModeState = fromStore(viewMode);
	const recentModulesState = fromStore(recentlyViewed);

	const recommendedModules = $derived.by(() => {
		if (recentModulesState.current.length === 0 || !data.featuredData) return [];

		const viewedCategories = [
			...new Set(recentModulesState.current.map((m) => m.category.toLowerCase()))
		];
		const viewedUuids = new Set(recentModulesState.current.map((m) => m.uuid));

		const allModules = [...(data.featuredData.popular || []), ...(data.featuredData.recent || [])];

		const uniqueModules = allModules.filter(
			(module, index, self) => self.findIndex((m) => m.uuid === module.uuid) === index
		);

		return uniqueModules
			.filter(
				(m) => viewedCategories.includes(m.category.toLowerCase()) && !viewedUuids.has(m.uuid)
			)
			.slice(0, 6);
	});
</script>

<Header session={data.session} />

<main id="main-content">
	<section class="hero">
		<div class="hero-content">
			<h1>
				Discover <span class="gradient-text">modules</span> for your Waybar
			</h1>
			<p>
				Find community-created modules to enhance your Waybar experience. Download with a single
				click using Waybar Manager.
			</p>
			<div class="hero-search">
				<SearchInput size="lg" />
			</div>
			<div class="hero-actions">
				<a href="/browse" class="btn btn-primary btn-large">Browse All Modules</a>
				{#if data.session?.user}
					<a href="/upload" class="btn btn-secondary btn-large">Upload Module</a>
				{:else}
					<a href="/login" class="btn btn-secondary btn-large">Log In to Upload</a>
				{/if}
			</div>
		</div>
	</section>

	<section class="categories-section">
		<div class="section-header">
			<h2>Browse by Category</h2>
		</div>
		<div class="categories-grid">
			{#each categories as cat (cat.slug)}
				<a
					href="/browse?category={cat.slug}"
					class="category-card"
					style="--cat-color: {cat.color}"
				>
					<img src={cat.icon} alt="" class="category-icon" />
					<span class="category-name">{cat.name}</span>
				</a>
			{/each}
		</div>
	</section>

	{#if recommendedModules.length > 0}
		<section class="modules-section recommended-section">
			<div class="section-header">
				<div>
					<h2>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
						Recommended for You
					</h2>
					<p>Based on modules you've viewed</p>
				</div>
				<a href="/browse" class="see-all">Browse all →</a>
			</div>
			<div
				class="module-container"
				class:grid={viewModeState.current === 'grid'}
				class:list={viewModeState.current === 'list'}
			>
				{#each recommendedModules as module, i (module.uuid)}
					{#if viewModeState.current === 'grid'}
						<ModuleCard
							uuid={module.uuid}
							name={module.name}
							author={module.author}
							description={module.description}
							category={module.category}
							downloads={module.downloads}
							verified={module.verified_author}
							delay={i * 50}
						/>
					{:else}
						<ModuleCardRow
							uuid={module.uuid}
							name={module.name}
							author={module.author}
							description={module.description}
							category={module.category}
							downloads={module.downloads}
							verified={module.verified_author}
							delay={i * 30}
						/>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	{#if data.error}
		<section class="modules-section">
			<div class="error-state">
				<p>{data.error}</p>
				<a href="/" class="btn btn-primary">Try Again</a>
			</div>
		</section>
	{:else if data.featuredData}
		{#if data.featuredData.featured.length > 0}
			<section class="modules-section">
				<div class="section-header">
					<div>
						<h2>Featured Modules</h2>
						<p>Hand-picked by our team</p>
					</div>
				</div>
				<div
					class="module-container"
					class:grid={viewModeState.current === 'grid'}
					class:list={viewModeState.current === 'list'}
					class:featured-grid={viewModeState.current === 'grid'}
				>
					{#each data.featuredData.featured as module, i (module.uuid)}
						{#if viewModeState.current === 'grid'}
							<ModuleCard
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 50}
							/>
						{:else}
							<ModuleCardRow
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 30}
							/>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		{#if data.featuredData.popular.length > 0}
			<section class="modules-section">
				<div class="section-header">
					<h2>Popular Modules</h2>
					<a href="/browse?sort=popular" class="see-all">See all →</a>
				</div>
				<div
					class="module-container"
					class:grid={viewModeState.current === 'grid'}
					class:list={viewModeState.current === 'list'}
				>
					{#each data.featuredData.popular as module, i (module.uuid)}
						{#if viewModeState.current === 'grid'}
							<ModuleCard
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 50}
							/>
						{:else}
							<ModuleCardRow
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 30}
							/>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		{#if data.featuredData.recent.length > 0}
			<section class="modules-section">
				<div class="section-header">
					<h2>Recently Added</h2>
					<a href="/browse?sort=recent" class="see-all">See all →</a>
				</div>
				<div
					class="module-container"
					class:grid={viewModeState.current === 'grid'}
					class:list={viewModeState.current === 'list'}
				>
					{#each data.featuredData.recent as module, i (module.uuid)}
						{#if viewModeState.current === 'grid'}
							<ModuleCard
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 50}
							/>
						{:else}
							<ModuleCardRow
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 30}
							/>
						{/if}
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</main>

<Footer />

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
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
		font-size: 3rem;
		font-weight: 700;
		margin: var(--space-lg) 0;
		line-height: 1.15;
	}

	.gradient-text {
		background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 50%, #ec4899 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-content p {
		color: var(--color-text-muted);
		font-size: 1.25rem;
		margin-bottom: var(--space-xl);
		line-height: 1.6;
	}

	.hero-search {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-xl);
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		justify-content: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 1rem;
		transition: background-color var(--duration-fast) var(--ease-out);
		text-decoration: none;
		border: none;
		cursor: pointer;
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
		background-color: #5068d9;
	}

	.btn-secondary {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-elevated);
	}

	.categories-section {
		padding: var(--space-2xl);
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-md);
	}

	.category-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.category-card:hover {
		border-color: var(--cat-color);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.category-icon {
		width: 32px;
		height: 32px;
	}

	.category-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.modules-section {
		padding: var(--space-2xl);
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
	}

	.recommended-section {
		background: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}

	.recommended-section .section-header h2 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.recommended-section .section-header h2 svg {
		color: var(--color-warning);
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
		font-weight: 500;
	}

	.see-all:hover {
		text-decoration: underline;
	}

	.error-state {
		text-align: center;
		padding: var(--space-2xl);
		color: var(--color-text-muted);
	}

	.error-state p {
		margin-bottom: var(--space-lg);
		color: var(--color-error);
	}

	.module-container.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-lg);
	}

	.module-container.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.module-container.featured-grid {
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	}

	@media (max-width: 768px) {
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

		.categories-section,
		.modules-section {
			padding: var(--space-lg);
		}

		.categories-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.module-container.grid {
			grid-template-columns: 1fr;
		}
	}
</style>

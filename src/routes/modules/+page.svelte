<script lang="ts">
	import type { PageData } from './$types';
	import { fromStore } from 'svelte/store';
	import CategoryPills from '$lib/components/CategoryPills.svelte';
	import ModuleSection from '$lib/components/ModuleSection.svelte';
	import { getHomepageCategories } from '$lib/constants/categories';
	import { recentlyViewed } from '$lib/stores/recentlyViewed';

	let { data }: { data: PageData } = $props();

	const categories = getHomepageCategories();
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

<div class="browse-discover">
	<section class="categories-section">
		<div class="section-header">
			<div>
				<h2>Browse by Category</h2>
				<p>Jump into the essentials without the noise</p>
			</div>
			<a href="/modules/search" class="see-all">See all &rarr;</a>
		</div>
		<CategoryPills {categories} baseUrl="/modules/search" />
	</section>

	{#if recommendedModules.length > 0}
		<ModuleSection
			title="Recommended for You"
			subtitle="Based on modules you've viewed"
			modules={recommendedModules}
			seeAllUrl="/modules/search"
		/>
	{/if}

	{#if data.error}
		<section class="error-section">
			<div class="error-state">
				<p>{data.error}</p>
				<a href="/modules" class="btn btn-primary">Try Again</a>
			</div>
		</section>
	{:else if data.featuredData}
		{#if data.featuredData.featured.length > 0}
			<ModuleSection
				title="Featured Modules"
				subtitle="Hand-picked by our team"
				modules={data.featuredData.featured.slice(0, 3)}
			/>
		{/if}

		{#if data.featuredData.popular.length > 0}
			<ModuleSection
				title="Popular Modules"
				subtitle="Top downloads and community favorites"
				modules={data.featuredData.popular}
				seeAllUrl="/modules/search?sort=popular"
			/>
		{/if}

		{#if data.featuredData.recent.length > 0}
			<ModuleSection
				title="Recently Added"
				subtitle="Fresh modules, straight from the registry"
				modules={data.featuredData.recent.slice(0, 3)}
				seeAllUrl="/modules/search?sort=recent"
			/>
		{/if}
	{/if}
</div>

<style>
	.browse-discover {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: 0 var(--space-lg);
	}

	.categories-section {
		padding: var(--space-2xl) 0;
	}

	.section-header {
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
	}

	.see-all {
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

	.error-section {
		padding: var(--space-2xl);
		text-align: center;
	}

	.error-state {
		padding: var(--space-xl);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.error-state p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	@media (max-width: 768px) {
		.browse-discover {
			padding: 0 var(--space-md);
		}

		.section-header {
			flex-direction: column;
			gap: var(--space-sm);
		}

		.section-header h2 {
			font-size: 1.5rem;
		}
	}
</style>

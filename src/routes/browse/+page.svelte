<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import ModuleCardRow from '$lib/components/ModuleCardRow.svelte';
	import ViewToggle from '$lib/components/ViewToggle.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { calculatePopularityScore, calculateTrendingScore } from '$lib/utils/popularity';
	import { getBrowseCategories } from '$lib/constants/categories';
	import { viewMode, type ViewMode } from '$lib/stores/viewMode';
	import { sidebarCollapsed } from '$lib/stores/sidebar';
	import SidebarToggle from '$lib/components/SidebarToggle.svelte';

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
		created_at: string;
	}

	const categories = getBrowseCategories();

	const sortOptions = [
		{ name: 'Most Popular', value: 'popular' },
		{ name: 'Trending', value: 'trending' },
		{ name: 'Recently Added', value: 'recent' },
		{ name: 'Most Downloads', value: 'downloads' },
		{ name: 'Alphabetical', value: 'alpha' }
	];

	const ITEMS_PER_PAGE = 12;

	const allModules = $derived(data.modules as Module[]);
	const error = $derived(data.error ?? null);

	let searchQuery = $state('');
	let selectedCategory = $state('');
	let selectedSort = $state('popular');
	let currentPage = $state(1);

	let mobileFiltersOpen = $state(false);
	let currentViewMode = $state<ViewMode>('grid');
	let isSidebarCollapsed = $state(false);

	$effect(() => {
		const unsubscribe = viewMode.subscribe((value) => {
			currentViewMode = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = sidebarCollapsed.subscribe((value) => {
			isSidebarCollapsed = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		const params = $page.url.searchParams;
		searchQuery = params.get('q') || '';
		selectedCategory = params.get('category') || '';
		selectedSort = params.get('sort') || 'popular';
		currentPage = parseInt(params.get('page') || '1');
	});

	const filteredModules = $derived.by(() => {
		let result = [...allModules];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(m) =>
					m.name.toLowerCase().includes(query) ||
					m.description.toLowerCase().includes(query) ||
					m.author.toLowerCase().includes(query)
			);
		}

		if (selectedCategory) {
			result = result.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
		}

		switch (selectedSort) {
			case 'popular':
				result.sort((a, b) => calculatePopularityScore(b) - calculatePopularityScore(a));
				break;
			case 'trending':
				result.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
				break;
			case 'downloads':
				result.sort((a, b) => b.downloads - a.downloads);
				break;
			case 'recent':
				result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
				break;
			case 'alpha':
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
		}

		return result;
	});

	const totalPages = $derived(Math.ceil(filteredModules.length / ITEMS_PER_PAGE));

	const paginatedModules = $derived(
		filteredModules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
	);

	function updateUrl(options: { replaceState?: boolean } = {}) {
		const params = new SvelteURLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (selectedCategory) params.set('category', selectedCategory);
		if (selectedSort !== 'popular') params.set('sort', selectedSort);
		if (currentPage > 1) params.set('page', currentPage.toString());

		const newUrl = params.toString() ? `/browse?${params.toString()}` : '/browse';
		goto(newUrl, {
			replaceState: options.replaceState ?? false,
			noScroll: true,
			keepFocus: true
		});
	}

	function handleSearch(query: string) {
		searchQuery = query;
		currentPage = 1;
		updateUrl({ replaceState: true });
	}

	function handleCategoryChange(slug: string) {
		selectedCategory = slug;
		currentPage = 1;
		updateUrl();
		mobileFiltersOpen = false;
	}

	function handleSortChange(e: Event) {
		selectedSort = (e.target as HTMLSelectElement).value;
		currentPage = 1;
		updateUrl();
	}

	function handlePageChange(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		updateUrl();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function getPageNumbers(): (number | 'ellipsis')[] {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | 'ellipsis')[] = [1];

		if (currentPage > 3) {
			pages.push('ellipsis');
		}

		const start = Math.max(2, currentPage - 1);
		const end = Math.min(totalPages - 1, currentPage + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (currentPage < totalPages - 2) {
			pages.push('ellipsis');
		}

		pages.push(totalPages);

		return pages;
	}
</script>

<Header session={data.session} />

<main id="main-content">
	<div class="browse-header">
		<div class="browse-header-content">
			<div class="browse-header-text">
				<h1>Browse Modules</h1>
				<p>Discover {filteredModules.length} community-created modules for Waybar</p>
			</div>
			<div class="browse-controls">
				<div class="browse-search">
					<SearchInput
						bind:value={searchQuery}
						placeholder="Search modules..."
						size="md"
						debounce={300}
						oninput={handleSearch}
						onsubmit={handleSearch}
					/>
				</div>
				<ViewToggle />
				<SidebarToggle />
			</div>
		</div>
	</div>

	<div class="browse-layout" class:sidebar-collapsed={isSidebarCollapsed}>
		<button
			class="mobile-filter-toggle"
			onclick={() => (mobileFiltersOpen = !mobileFiltersOpen)}
			aria-expanded={mobileFiltersOpen}
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
			</svg>
			Filters
		</button>

		<aside
			id="filter-sidebar"
			class="filter-sidebar"
			class:open={mobileFiltersOpen}
			class:collapsed={isSidebarCollapsed}
		>
			<div class="filter-section">
				<h3>Category</h3>
				<div class="filter-options">
					{#each categories as cat (cat.slug)}
						<button
							class="filter-option"
							class:active={selectedCategory === cat.slug}
							onclick={() => handleCategoryChange(cat.slug)}
						>
							{cat.name}
						</button>
					{/each}
				</div>
			</div>

			<div class="filter-section">
				<h3>Sort By</h3>
				<select class="sort-select" value={selectedSort} onchange={handleSortChange}>
					{#each sortOptions as opt (opt.value)}
						<option value={opt.value}>{opt.name}</option>
					{/each}
				</select>
			</div>
		</aside>

		<section class="results">
			{#if error}
				<div class="empty-state">
					<p class="error">{error}</p>
					<a href="/browse" class="btn btn-primary">Refresh</a>
				</div>
			{:else if paginatedModules.length === 0}
				<div class="empty-state">
					<svg
						width="48"
						height="48"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<h2>No modules found</h2>
					<p>Try adjusting your search or filters</p>
					{#if searchQuery || selectedCategory}
						<button
							class="btn btn-secondary"
							onclick={() => {
								searchQuery = '';
								selectedCategory = '';
								currentPage = 1;
								updateUrl();
							}}
						>
							Clear Filters
						</button>
					{/if}
				</div>
			{:else}
				<div
					class="module-container"
					class:grid={currentViewMode === 'grid'}
					class:list={currentViewMode === 'list'}
				>
					{#each paginatedModules as module, i (module.uuid)}
						{#if currentViewMode === 'grid'}
							<ModuleCard
								uuid={module.uuid}
								name={module.name}
								author={module.author}
								description={module.description}
								category={module.category}
								downloads={module.downloads}
								verified={module.verified_author}
								delay={i * 30}
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
								delay={i * 15}
							/>
						{/if}
					{/each}
				</div>

				{#if totalPages > 1}
					<nav class="pagination" aria-label="Pagination">
						<button
							class="pagination-btn"
							disabled={currentPage === 1}
							onclick={() => handlePageChange(currentPage - 1)}
							aria-label="Previous page"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="15 18 9 12 15 6" />
							</svg>
							<span class="pagination-label">Previous</span>
						</button>

						<div class="pagination-pages">
							{#each getPageNumbers() as pageNum, i (i)}
								{#if pageNum === 'ellipsis'}
									<span class="pagination-ellipsis" aria-hidden="true">...</span>
								{:else}
									<button
										class="pagination-page"
										class:active={pageNum === currentPage}
										onclick={() => handlePageChange(pageNum)}
										aria-current={pageNum === currentPage ? 'page' : undefined}
									>
										{pageNum}
									</button>
								{/if}
							{/each}
						</div>

						<button
							class="pagination-btn"
							disabled={currentPage === totalPages}
							onclick={() => handlePageChange(currentPage + 1)}
							aria-label="Next page"
						>
							<span class="pagination-label">Next</span>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
					</nav>
				{/if}
			{/if}
		</section>
	</div>
</main>

<Footer />

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.browse-header {
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
	}

	.browse-header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-2xl);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-xl);
		flex-wrap: wrap;
	}

	.browse-header-text h1 {
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.browse-header-text p {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.browse-controls {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.browse-search {
		flex: 1;
		max-width: 400px;
		min-width: 250px;
	}

	.browse-layout {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: var(--space-2xl);
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-2xl);
		width: 100%;
		transition: grid-template-columns var(--duration-normal) var(--ease-out);
	}

	.browse-layout.sidebar-collapsed {
		grid-template-columns: 48px 1fr;
	}

	.mobile-filter-toggle {
		display: none;
	}

	.filter-sidebar {
		position: sticky;
		top: 80px;
		height: fit-content;
		overflow: hidden;
		transition: width var(--duration-normal) var(--ease-out);
	}

	.filter-sidebar.collapsed {
		width: 48px;
	}

	.filter-sidebar.collapsed .filter-section h3,
	.filter-sidebar.collapsed .filter-option,
	.filter-sidebar.collapsed .sort-select {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			visibility var(--duration-fast) var(--ease-out);
	}

	.filter-section {
		margin-bottom: var(--space-xl);
	}

	.filter-section h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.filter-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.filter-option {
		padding: var(--space-sm) var(--space-md);
		background: none;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: 0.9rem;
		text-align: left;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.filter-option:hover {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
	}

	.filter-option.active {
		background-color: var(--color-primary);
		color: white;
	}

	.sort-select {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		padding-right: 36px;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-normal);
		font-size: 0.9rem;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
	}

	.sort-select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--focus-ring);
	}

	.results {
		min-height: 400px;
	}

	.module-container {
		transition: gap var(--duration-normal) var(--ease-out);
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-3xl);
		text-align: center;
		color: var(--color-text-muted);
	}

	.empty-state svg {
		margin-bottom: var(--space-lg);
		opacity: 0.5;
	}

	.empty-state h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-normal);
		margin-bottom: var(--space-sm);
	}

	.empty-state p {
		margin-bottom: var(--space-lg);
	}

	.empty-state .error {
		color: var(--color-error);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 0.9rem;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
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

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		margin-top: var(--space-2xl);
		padding-top: var(--space-xl);
		border-top: 1px solid var(--color-border);
	}

	.pagination-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.pagination-btn:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pagination-pages {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.pagination-page {
		min-width: 36px;
		height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.pagination-page:hover {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
	}

	.pagination-page.active {
		background-color: var(--color-primary);
		color: white;
	}

	.pagination-ellipsis {
		color: var(--color-text-faint);
		padding: 0 var(--space-xs);
	}

	@media (max-width: 900px) {
		.browse-layout {
			grid-template-columns: 1fr;
			padding: var(--space-lg);
		}

		.mobile-filter-toggle {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			padding: var(--space-sm) var(--space-md);
			background-color: var(--color-bg-surface);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			color: var(--color-text-normal);
			font-size: 0.9rem;
			cursor: pointer;
			margin-bottom: var(--space-lg);
		}

		.filter-sidebar {
			display: none;
			position: fixed;
			inset: 0;
			top: 57px;
			z-index: 50;
			background-color: var(--color-bg-base);
			padding: var(--space-lg);
			overflow-y: auto;
		}

		.filter-sidebar.open {
			display: block;
		}

		.pagination-label {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.browse-header {
			padding: var(--space-lg);
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.browse-layout,
		.filter-sidebar,
		.filter-sidebar.collapsed .filter-section h3,
		.filter-sidebar.collapsed .filter-option,
		.filter-sidebar.collapsed .sort-select {
			transition: none;
		}
	}
</style>

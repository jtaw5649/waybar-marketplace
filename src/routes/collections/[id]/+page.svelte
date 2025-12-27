<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { formatDate } from '$lib/utils/formatDate';

	let { data }: { data: PageData } = $props();

	let collection = $derived(data.collection);
	let isOwner = $derived(data.isOwner);

	function getVisibilityLabel(visibility: string): string {
		switch (visibility) {
			case 'public':
				return 'Public';
			case 'unlisted':
				return 'Unlisted';
			default:
				return 'Private';
		}
	}
</script>

<svelte:head>
	<title>{collection.name} - Barforge Modules</title>
	<meta
		name="description"
		content={collection.description ||
			`A collection of ${collection.module_count} Barforge modules`}
	/>
</svelte:head>

<Header session={data.session} />

<main id="main-content">
	<div class="collection-page">
		<header class="collection-header">
			<div class="collection-title">
				<h1>{collection.name}</h1>
				<span class="visibility-badge">{getVisibilityLabel(collection.visibility)}</span>
			</div>
			{#if collection.description}
				<p class="collection-description">{collection.description}</p>
			{/if}
			<div class="collection-meta">
				<a href="/users/{collection.owner.username}" class="owner-link">
					{#if collection.owner.avatar_url}
						<img src={collection.owner.avatar_url} alt="" class="owner-avatar" loading="lazy" />
					{/if}
					<span>{collection.owner.display_name || collection.owner.username}</span>
				</a>
				<span class="separator">·</span>
				<span>{collection.module_count} module{collection.module_count !== 1 ? 's' : ''}</span>
				<span class="separator">·</span>
				<span>Updated {formatDate(collection.updated_at)}</span>
			</div>
		</header>

		{#if collection.modules.length === 0}
			<div class="empty-state">
				<svg
					viewBox="0 0 24 24"
					width="48"
					height="48"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
				</svg>
				<h3>This collection is empty</h3>
				<p>
					{#if isOwner}
						Add modules to this collection from their detail pages.
					{:else}
						No modules have been added to this collection yet.
					{/if}
				</p>
			</div>
		{:else}
			<div class="modules-grid">
				{#each collection.modules as module (module.uuid)}
					<div class="module-wrapper">
						<ModuleCard
							uuid={module.uuid}
							name={module.name}
							author={module.author}
							description=""
							category={module.category}
							downloads={0}
						/>
						{#if module.note}
							<p class="module-note">{module.note}</p>
						{/if}
						{#if isOwner}
							<form
								method="POST"
								action="?/removeModule"
								class="remove-form"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											toast.success('Module removed from collection');
											await update();
										} else {
											toast.error('Failed to remove module');
										}
									};
								}}
							>
								<input type="hidden" name="module_uuid" value={module.uuid} />
								<button type="submit" class="btn-remove" title="Remove from collection">
									<svg
										viewBox="0 0 24 24"
										width="16"
										height="16"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</main>

<Footer />

<style>
	main {
		flex: 1;
		padding-top: 5rem;
	}

	.collection-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-2xl);
	}

	.collection-header {
		margin-bottom: var(--space-2xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.collection-title {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.collection-title h1 {
		font-size: 2rem;
		font-weight: 700;
	}

	.visibility-badge {
		padding: var(--space-xs) var(--space-sm);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.collection-description {
		font-size: 1rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-lg);
	}

	.collection-meta {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.owner-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-normal);
		text-decoration: none;
	}

	.owner-link:hover {
		color: var(--color-primary);
	}

	.owner-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
	}

	.separator {
		color: var(--color-text-faint);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-3xl);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.empty-state svg {
		color: var(--color-text-muted);
		margin-bottom: var(--space-lg);
	}

	.empty-state h3 {
		margin-bottom: var(--space-md);
	}

	.empty-state p {
		color: var(--color-text-muted);
	}

	.modules-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-lg);
	}

	.module-wrapper {
		position: relative;
	}

	.module-note {
		margin-top: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	.remove-form {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
	}

	.btn-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.btn-remove:hover {
		background-color: var(--color-error);
		border-color: var(--color-error);
		color: white;
	}

	@media (max-width: 768px) {
		.collection-page {
			padding: var(--space-lg);
		}

		.collection-title {
			flex-direction: column;
			align-items: flex-start;
		}

		.collection-meta {
			flex-wrap: wrap;
		}

		.modules-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

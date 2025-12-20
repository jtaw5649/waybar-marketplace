<script lang="ts">
	import { fly } from 'svelte/transition';
	import Badge from './Badge.svelte';
	import Tag from './Tag.svelte';
	import StarFavorite from './StarFavorite.svelte';
	import { formatDownloads } from '$lib/utils/formatDownloads';
	import { useModuleCard } from '$lib/hooks/useModuleCard.svelte';

	interface Props {
		uuid: string;
		name: string;
		author: string;
		description: string;
		category: string;
		downloads: number;
		version?: string;
		verified?: boolean;
		icon?: string;
		delay?: number;
		createdAt?: string;
	}

	let {
		uuid,
		name,
		author,
		description,
		category,
		downloads,
		version,
		verified = false,
		icon,
		delay = 0,
		createdAt
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	const { categoryVariant, categoryColor, isNew, isStarred } = useModuleCard({
		uuid,
		category,
		createdAt
	});
</script>

<div class="card-wrapper" in:fly={{ y: 20, duration: 300, delay }}>
	<div class="favorite-action">
		<StarFavorite {uuid} size="sm" />
	</div>
	<a href="/modules/{encodeURIComponent(uuid)}" class="card" style="--card-color: {categoryColor}">
		<div class="card-content">
			{#if icon}
				<div class="card-icon">
					<img src={icon} alt="" />
				</div>
			{:else}
				<div class="card-icon placeholder">
					{name.charAt(0).toUpperCase()}
				</div>
			{/if}

			<div class="card-main">
				<div class="card-header">
					<h3>{name}</h3>
					{#if version}
						<Badge size="sm" variant="version">v{version}</Badge>
					{/if}
				</div>
				<p class="author">by {author}</p>
				<p class="description">{description}</p>
			</div>
		</div>

		<div class="card-footer">
			<div class="card-tags">
				<Tag variant={categoryVariant}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<line x1="3" y1="9" x2="21" y2="9" />
						<line x1="9" y1="21" x2="9" y2="9" />
					</svg>
					{category}
				</Tag>
				{#if isNew}
					<Tag variant="blue">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polygon
								points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
							/>
						</svg>
						New
					</Tag>
				{/if}
				{#if verified}
					<Tag variant="green">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
							<polyline points="22 4 12 14.01 9 11.01" />
						</svg>
						Verified
					</Tag>
				{/if}
				{#if isStarred}
					<Tag variant="amber">
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
						Starred
					</Tag>
				{/if}
			</div>
			<div class="card-stats">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				{formatDownloads(downloads)}
			</div>
		</div>
	</a>
</div>

<style>
	.card-wrapper {
		position: relative;
	}

	.card {
		display: block;
		position: relative;
		padding: var(--space-lg);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition:
			transform var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.favorite-action {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		z-index: 1;
	}

	.card:hover {
		transform: translateY(-2px);
		border-color: var(--card-color);
		box-shadow:
			var(--shadow-md),
			0 0 20px color-mix(in srgb, var(--card-color) 30%, transparent);
		text-decoration: none;
	}

	.card:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.card-content {
		display: flex;
		gap: var(--space-md);
	}

	.card-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		flex-shrink: 0;
		overflow: hidden;
	}

	.card-icon.placeholder {
		background: linear-gradient(135deg, var(--color-primary), var(--color-info));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.card-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-main {
		flex: 1;
		min-width: 0;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-xs);
	}

	.card-header h3 {
		font-size: 1rem;
		font-weight: 600;
	}

	.author {
		font-size: 0.8rem;
		color: var(--color-text-faint);
		margin-bottom: var(--space-sm);
	}

	.description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1.5;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		margin-top: var(--space-lg);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
	}

	.card-tags {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.card-stats {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-warning);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-warning) 15%, transparent),
			color-mix(in srgb, var(--color-warning) 20%, transparent)
		);
		padding: 4px 10px;
		border-radius: 9999px;
		flex-shrink: 0;
	}

	.card-stats svg {
		width: 14px;
		height: 14px;
		color: var(--color-warning);
	}
</style>

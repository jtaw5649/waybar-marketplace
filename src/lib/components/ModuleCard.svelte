<script lang="ts">
	import { fly } from 'svelte/transition';
	import { CheckCircle, Download, Star } from 'lucide-svelte';
	import AuthorLink from './AuthorLink.svelte';
	import Badge from './Badge.svelte';
	import Tag from './Tag.svelte';
	import StarFavorite from './StarFavorite.svelte';
	import { formatDownloads } from '$lib/utils/formatDownloads';
	import { useModuleCard } from '$lib/hooks/useModuleCard.svelte';
	import { encodeModuleUuid } from '$lib/utils/url';

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

	const { categoryVariant, categoryColor, isNew, isStarred } = useModuleCard(() => ({
		uuid,
		category,
		createdAt
	}));
</script>

<div class="card-wrapper" in:fly={{ y: 20, duration: 300, delay }}>
	<div class="favorite-action">
		<StarFavorite {uuid} size="sm" />
	</div>
	<a
		href="/modules/{encodeModuleUuid(uuid)}"
		class="card"
		style="--card-color: {categoryColor}"
		aria-label={`View ${name} module`}
	>
		<div class="card-content">
			<div class="card-icon">
				<div class="card-icon-frame">
					{#if icon}
						<img class="card-icon-image" src={icon} alt="" />
					{:else}
						<span class="card-icon-initial">{name.charAt(0).toUpperCase()}</span>
					{/if}
				</div>
			</div>

			<div class="card-main">
				<div class="card-header">
					<h3>{name}</h3>
					{#if version}
						<Badge size="sm" variant="version">v{version}</Badge>
					{/if}
				</div>
				<p class="author">by <AuthorLink username={author} /></p>
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
						<CheckCircle size={14} />
						Verified
					</Tag>
				{/if}
				{#if isStarred}
					<Tag variant="amber">
						<span class="star-filled"><Star size={14} /></span>
						Starred
					</Tag>
				{/if}
			</div>
			<div class="card-stats">
				<Download size={14} />
				{formatDownloads(downloads)}
			</div>
		</div>
	</a>
</div>

<style>
	.star-filled :global(svg) {
		fill: currentColor;
	}

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
		border-color: color-mix(in srgb, var(--card-color) 45%, var(--color-border));
		box-shadow:
			var(--shadow-md),
			0 0 22px rgba(111, 125, 255, 0.18);
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
		width: 52px;
		height: 52px;
		border-radius: var(--radius-md);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-icon-frame {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-md);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 18%, var(--color-bg-elevated)),
			color-mix(in srgb, var(--color-info) 10%, var(--color-bg-elevated))
		);
		border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.card-icon-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 6px;
		filter: drop-shadow(0 6px 10px rgba(6, 9, 18, 0.35));
	}

	.card-icon-initial {
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--color-text-normal);
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
		margin-top: var(--space-md);
		padding-top: var(--space-sm);
		border-top: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
	}

	.card-tags {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	.card-stats {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-primary);
		background: rgba(111, 125, 255, 0.14);
		border: 1px solid rgba(111, 125, 255, 0.25);
		padding: 4px 10px;
		border-radius: 9999px;
		flex-shrink: 0;
	}

	.card-stats :global(svg) {
		color: var(--color-primary);
	}
</style>

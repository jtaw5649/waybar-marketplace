<script lang="ts">
	import { fly } from 'svelte/transition';
	import { CheckCircle, Download, Star } from 'lucide-svelte';
	import AuthorLink from './AuthorLink.svelte';
	import Tag from './Tag.svelte';
	import StarFavorite from './StarFavorite.svelte';
	import { formatDownloads } from '$lib/utils/formatDownloads';
	import { useModuleCard } from '$lib/hooks/useModuleCard.svelte';
	import { encodeModuleUuid } from '$lib/utils/url';

	interface Props {
		uuid: string;
		name: string;
		author: string;
		description?: string;
		category: string;
		downloads: number;
		version?: string;
		verified?: boolean;
		icon?: string;
		delay?: number;
		lastUpdated?: string;
	}

	let {
		uuid,
		name,
		author,
		category,
		downloads,
		version,
		verified = false,
		icon,
		delay = 0,
		lastUpdated
	}: Props = $props();

	const { categoryVariant, categoryColor, isNew, isStarred } = useModuleCard(() => ({
		uuid,
		category,
		lastUpdated
	}));
</script>

<div class="row-wrapper" in:fly={{ y: 10, duration: 200, delay }}>
	<a href="/modules/{encodeModuleUuid(uuid)}" class="row" style="--row-color: {categoryColor}">
		<div class="row-icon">
			<div class="row-icon-frame">
				{#if icon}
					<img
						class="row-icon-image"
						src={icon}
						alt=""
						width="40"
						height="40"
						loading="lazy"
						decoding="async"
					/>
				{:else}
					<span class="row-icon-initial">{name.charAt(0).toUpperCase()}</span>
				{/if}
			</div>
		</div>

		<div class="row-main">
			<div class="row-title">
				<h3>{name}</h3>
				{#if version}
					<span class="version-badge">v{version}</span>
				{/if}
				{#if isNew}
					<span class="new-badge">New</span>
				{/if}
				{#if verified}
					<span class="verified-icon" aria-label="Verified author">
						<CheckCircle size={14} />
					</span>
				{/if}
				{#if isStarred}
					<span class="starred-badge" aria-label="Starred">
						<Star size={14} />
					</span>
				{/if}
			</div>
			<p class="row-author">by <AuthorLink username={author} /></p>
		</div>

		<div class="row-category">
			<Tag variant={categoryVariant}>{category}</Tag>
		</div>

		<div class="row-downloads">
			<Download size={14} />
			{formatDownloads(downloads)}
		</div>
	</a>
	<div class="row-favorite">
		<StarFavorite {uuid} size="sm" />
	</div>
</div>

<style>
	.row-wrapper {
		position: relative;
	}

	.row {
		display: grid;
		grid-template-columns: 40px 1fr auto auto;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		padding-right: 56px;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.row:hover {
		border-color: color-mix(in srgb, var(--row-color) 45%, var(--color-border));
		box-shadow: var(--shadow-sm);
	}

	.row:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.row-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.row-icon-frame {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-sm);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-primary) 16%, var(--color-bg-elevated)),
			color-mix(in srgb, var(--color-info) 10%, var(--color-bg-elevated))
		);
		border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.row-icon-image {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 6px;
		filter: drop-shadow(0 6px 10px rgba(6, 9, 18, 0.35));
	}

	.row-icon-initial {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-normal);
	}

	.row-main {
		min-width: 0;
	}

	.row-title {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.row-title h3 {
		font-size: 0.9375rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.verified-icon {
		display: inline-flex;
		color: var(--color-success);
		flex-shrink: 0;
	}

	.version-badge {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--color-text-faint);
		background-color: color-mix(in srgb, var(--color-bg-elevated) 80%, transparent);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.new-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-primary);
		background-color: rgba(111, 125, 255, 0.16);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.starred-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--color-warning);
		flex-shrink: 0;
	}

	.starred-badge :global(svg) {
		fill: currentColor;
	}

	.row-author {
		font-size: 0.8125rem;
		color: var(--color-text-faint);
	}

	.row-category {
		flex-shrink: 0;
	}

	.row-downloads {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.row-downloads :global(svg) {
		color: var(--color-primary);
	}

	.row-favorite {
		position: absolute;
		right: var(--space-md);
		top: 50%;
		transform: translateY(-50%);
	}

	@media (max-width: 768px) {
		.row {
			grid-template-columns: 40px 1fr auto;
		}

		.row-category {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.row {
			grid-template-columns: 36px 1fr auto;
			gap: var(--space-sm);
			padding: var(--space-sm) var(--space-md);
			padding-right: 48px;
		}

		.row-icon {
			width: 36px;
			height: 36px;
		}

		.row-downloads {
			display: none;
		}
	}
</style>

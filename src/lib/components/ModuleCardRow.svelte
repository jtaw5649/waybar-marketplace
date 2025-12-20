<script lang="ts">
	import { fly } from 'svelte/transition';
	import Tag from './Tag.svelte';
	import StarFavorite from './StarFavorite.svelte';
	import { formatDownloads } from '$lib/utils/formatDownloads';
	import { useModuleCard } from '$lib/hooks/useModuleCard.svelte';

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
		createdAt?: string;
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
		createdAt
	}: Props = $props();

	const { categoryVariant, categoryColor, isNew, isStarred } = useModuleCard(() => ({
		uuid,
		category,
		createdAt
	}));
</script>

<div class="row-wrapper" in:fly={{ y: 10, duration: 200, delay }}>
	<a href="/modules/{encodeURIComponent(uuid)}" class="row" style="--row-color: {categoryColor}">
		<div class="row-icon">
			{#if icon}
				<img src={icon} alt="" />
			{:else}
				<span class="icon-placeholder">{name.charAt(0).toUpperCase()}</span>
			{/if}
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
					<svg
						class="verified-icon"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-label="Verified author"
					>
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
				{/if}
				{#if isStarred}
					<span class="starred-badge">
						<svg viewBox="0 0 24 24" fill="currentColor" aria-label="Starred">
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
					</span>
				{/if}
			</div>
			<p class="row-author">by {author}</p>
		</div>

		<div class="row-category">
			<Tag variant={categoryVariant}>{category}</Tag>
		</div>

		<div class="row-downloads">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
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
		border-color: var(--row-color);
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
		overflow: hidden;
		flex-shrink: 0;
	}

	.row-icon img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.icon-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
		color: white;
		font-size: 1rem;
		font-weight: 600;
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
		width: 16px;
		height: 16px;
		color: var(--color-success);
		flex-shrink: 0;
	}

	.version-badge {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--color-text-faint);
		background-color: var(--color-bg-elevated);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.new-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-primary);
		background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
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

	.starred-badge svg {
		width: 14px;
		height: 14px;
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
		color: #fbbf24;
		flex-shrink: 0;
	}

	.row-downloads svg {
		width: 14px;
		height: 14px;
		color: #fb923c;
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

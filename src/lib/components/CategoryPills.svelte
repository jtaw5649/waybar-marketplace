<script lang="ts">
	import type { Category } from '$lib/constants/categories';

	interface Props {
		categories: Category[];
		baseUrl?: string;
	}

	let { categories, baseUrl = '/modules/search' }: Props = $props();
</script>

<div class="category-pills">
	{#each categories as cat (cat.slug)}
		<a class="category-pill" href="{baseUrl}?category={cat.slug}" style="--cat-color: {cat.color}">
			<img
				class="category-pill-icon"
				src={cat.icon}
				alt=""
				width="18"
				height="18"
				loading="lazy"
				decoding="async"
			/>
			<span class="category-pill-name">{cat.name}</span>
		</a>
	{/each}
</div>

<style>
	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.category-pill {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 8px 14px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--cat-color) 15%, var(--color-bg-elevated));
		border: 1px solid color-mix(in srgb, var(--cat-color) 30%, var(--color-border));
		color: var(--color-text-normal);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 500;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.category-pill:hover {
		border-color: var(--cat-color);
		transform: translateY(-1px);
		box-shadow: 0 6px 14px rgba(15, 18, 32, 0.35);
	}

	.category-pill-icon {
		width: 18px;
		height: 18px;
		opacity: 0.85;
	}

	.category-pill-name {
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.category-pills {
			gap: var(--space-xs);
		}
	}
</style>

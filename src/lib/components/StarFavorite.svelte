<script lang="ts">
	import { Star } from 'lucide-svelte';
	import { stars } from '$lib/stores/stars.svelte';

	interface Props {
		uuid: string;
		size?: 'sm' | 'md';
	}

	let { uuid, size = 'md' }: Props = $props();

	const isStarred = $derived(stars.isStarred(uuid));
	const iconSize = $derived(size === 'sm' ? 16 : 20);

	async function handleClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		await stars.toggle(uuid);
	}
</script>

<button
	class="star-favorite"
	class:favorited={isStarred}
	class:size-sm={size === 'sm'}
	onclick={handleClick}
	aria-label={isStarred ? 'Remove from stars' : 'Add to stars'}
	aria-pressed={isStarred}
>
	<Star size={iconSize} />
</button>

<style>
	.star-favorite {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: none;
		border: none;
		color: var(--color-text-faint);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.star-favorite.size-sm {
		width: 28px;
		height: 28px;
	}

	.star-favorite:hover {
		color: var(--color-warning);
		background-color: var(--color-bg-surface);
	}

	.star-favorite.favorited {
		color: var(--color-warning);
	}

	.star-favorite.favorited :global(svg) {
		fill: currentColor;
	}

	.star-favorite.favorited:hover {
		color: color-mix(in srgb, var(--color-warning) 80%, black);
	}

	.star-favorite:focus-visible {
		box-shadow: var(--focus-ring);
	}
</style>

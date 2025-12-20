<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { stars } from '$lib/stores/stars';

	interface Props {
		uuid: string;
		size?: 'sm' | 'md';
	}

	let { uuid, size = 'md' }: Props = $props();

	const starsState = fromStore(stars);

	const isStarred = $derived(starsState.current.starred.has(uuid));

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
	{#if isStarred}
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<path
				d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			/>
		</svg>
	{:else}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path
				d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			/>
		</svg>
	{/if}
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

	.star-favorite svg {
		width: 20px;
		height: 20px;
	}

	.star-favorite.size-sm {
		width: 28px;
		height: 28px;
	}

	.star-favorite.size-sm svg {
		width: 16px;
		height: 16px;
	}

	.star-favorite:hover {
		color: var(--color-warning);
		background-color: var(--color-bg-surface);
	}

	.star-favorite.favorited {
		color: var(--color-warning);
	}

	.star-favorite.favorited:hover {
		color: color-mix(in srgb, var(--color-warning) 80%, black);
	}

	.star-favorite:focus-visible {
		box-shadow: var(--focus-ring);
	}
</style>

<script lang="ts">
	interface Props {
		value: number;
		max?: number;
		readonly?: boolean;
		size?: 'sm' | 'md' | 'lg';
		onchange?: (value: number) => void;
	}

	let { value = 0, max = 5, readonly = false, size = 'md', onchange }: Props = $props();

	let hoverValue: number | null = $state(null);
	let containerRef: HTMLDivElement | null = $state(null);

	function handleClick(rating: number) {
		if (readonly) return;
		onchange?.(rating);
	}

	function handleMouseEnter(rating: number) {
		if (readonly) return;
		hoverValue = rating;
	}

	function handleMouseLeave() {
		hoverValue = null;
	}

	function handleKeyDown(e: KeyboardEvent, rating: number) {
		if (readonly) return;

		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onchange?.(rating);
			return;
		}

		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			const next = Math.min(rating + 1, max);
			onchange?.(next);
			focusStar(next);
			return;
		}

		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			const prev = Math.max(rating - 1, 1);
			onchange?.(prev);
			focusStar(prev);
		}
	}

	function focusStar(rating: number) {
		const button = containerRef?.querySelector(`button:nth-child(${rating})`) as HTMLButtonElement;
		button?.focus();
	}

	function getStarLabel(rating: number): string {
		return rating === 1 ? '1 star' : `${rating} stars`;
	}

	const displayValue = $derived(hoverValue ?? value);
</script>

<div
	bind:this={containerRef}
	class="star-rating star-{size}"
	class:readonly
	role={readonly ? 'img' : 'radiogroup'}
	aria-label={readonly ? `Rating: ${value} out of ${max} stars` : 'Rating'}
	onmouseleave={handleMouseLeave}
>
	{#each Array(max) as _, i (i)}
		{@const rating = i + 1}
		{@const isFilled = rating <= displayValue}
		{@const isHalf = !isFilled && rating - 0.5 <= displayValue}

		{#if readonly}
			<span class="star" class:filled={isFilled} class:half={isHalf} aria-hidden="true">
				{#if isFilled}
					<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
						<polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						/>
					</svg>
				{:else if isHalf}
					<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
						<defs>
							<linearGradient id="half-{i}">
								<stop offset="50%" stop-color="currentColor" />
								<stop offset="50%" stop-color="transparent" />
							</linearGradient>
						</defs>
						<polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
							fill="url(#half-{i})"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						/>
					</svg>
				{/if}
			</span>
		{:else}
			<button
				type="button"
				class="star"
				class:filled={isFilled}
				onclick={() => handleClick(rating)}
				onmouseenter={() => handleMouseEnter(rating)}
				onkeydown={(e) => handleKeyDown(e, rating)}
				aria-label={getStarLabel(rating)}
				aria-checked={value === rating}
				role="radio"
			>
				{#if isFilled}
					<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
						<polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						/>
					</svg>
				{/if}
			</button>
		{/if}
	{/each}
</div>

<style>
	.star-rating {
		display: inline-flex;
		gap: 2px;
	}

	.star-rating.readonly {
		pointer-events: none;
	}

	.star {
		color: var(--color-border);
		transition:
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.star.filled {
		color: var(--color-warning);
	}

	.star.half {
		color: var(--color-warning);
	}

	.star-rating:not(.readonly) .star {
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
	}

	.star-rating:not(.readonly) .star:hover {
		transform: scale(1.15);
	}

	.star-rating:not(.readonly) .star:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.star-sm .star svg {
		width: 14px;
		height: 14px;
	}

	.star-md .star svg {
		width: 18px;
		height: 18px;
	}

	.star-lg .star svg {
		width: 24px;
		height: 24px;
	}
</style>

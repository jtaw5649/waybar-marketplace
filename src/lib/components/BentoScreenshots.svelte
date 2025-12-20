<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface Screenshot {
		id: number;
		r2_key: string;
		alt_text?: string | null;
	}

	interface Props {
		screenshots: Screenshot[];
		getUrl: (r2Key: string) => string;
		isOwner?: boolean;
		onDelete?: (id: number) => void;
	}

	let { screenshots, getUrl, isOwner = false, onDelete }: Props = $props();

	let selectedIndex = $state<number | null>(null);
	let dialogRef: HTMLDialogElement;

	const gridSpans = ['span-large', 'span-medium', 'span-medium', 'span-small', 'span-small'];

	function openDialog(index: number) {
		selectedIndex = index;
		dialogRef?.showModal();
	}

	function closeDialog() {
		selectedIndex = null;
		dialogRef?.close();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (selectedIndex === null) return;

		if (e.key === 'Escape') {
			closeDialog();
		} else if (e.key === 'ArrowRight' && selectedIndex < screenshots.length - 1) {
			selectedIndex++;
		} else if (e.key === 'ArrowLeft' && selectedIndex > 0) {
			selectedIndex--;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogRef) {
			closeDialog();
		}
	}

	onMount(() => {
		return () => dialogRef?.close();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="bento-grid" class:has-many={screenshots.length > 2}>
	{#each screenshots as screenshot, i (screenshot.id)}
		<div
			class="bento-item {gridSpans[i] || 'span-small'}"
			in:fly={{ y: 20, duration: 300, delay: i * 50 }}
		>
			<button
				class="bento-btn"
				onclick={() => openDialog(i)}
				aria-label={screenshot.alt_text || `View screenshot ${i + 1}`}
			>
				<img
					src={getUrl(screenshot.r2_key)}
					alt={screenshot.alt_text || `Screenshot ${i + 1}`}
					loading="lazy"
				/>
				<div class="bento-overlay">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
					</svg>
				</div>
			</button>

			{#if isOwner && onDelete}
				<button
					class="delete-btn"
					onclick={() => onDelete(screenshot.id)}
					title="Delete screenshot"
					aria-label="Delete screenshot"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			{/if}
		</div>
	{/each}
</div>

<dialog
	bind:this={dialogRef}
	class="screenshot-dialog"
	onclick={handleBackdropClick}
	aria-label="Screenshot viewer"
>
	{#if selectedIndex !== null && screenshots[selectedIndex]}
		<div class="dialog-content" in:fly={{ y: 20, duration: 200 }}>
			<button class="close-btn" onclick={closeDialog} aria-label="Close">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>

			<div class="image-container">
				{#if selectedIndex > 0}
					<button
						class="nav-btn prev"
						onclick={() => selectedIndex !== null && selectedIndex--}
						aria-label="Previous"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="15 18 9 12 15 6" />
						</svg>
					</button>
				{/if}

				<img
					src={getUrl(screenshots[selectedIndex].r2_key)}
					alt={screenshots[selectedIndex].alt_text || `Screenshot ${selectedIndex + 1}`}
				/>

				{#if selectedIndex < screenshots.length - 1}
					<button
						class="nav-btn next"
						onclick={() => selectedIndex !== null && selectedIndex++}
						aria-label="Next"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</button>
				{/if}
			</div>

			<div class="counter">
				{selectedIndex + 1} / {screenshots.length}
			</div>

			{#if screenshots[selectedIndex].alt_text}
				<p class="caption">{screenshots[selectedIndex].alt_text}</p>
			{/if}
		</div>
	{/if}
</dialog>

<style>
	.bento-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 160px;
		gap: var(--space-md);
	}

	.bento-grid.has-many {
		grid-template-columns: repeat(4, 1fr);
	}

	.bento-item {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--color-border);
		background: var(--color-bg-surface);
	}

	.span-large {
		grid-column: span 2;
		grid-row: span 2;
	}

	.span-medium {
		grid-column: span 2;
		grid-row: span 1;
	}

	.span-small {
		grid-column: span 1;
		grid-row: span 1;
	}

	.bento-grid:not(.has-many) .bento-item {
		grid-column: span 1;
		grid-row: span 1;
	}

	.bento-btn {
		width: 100%;
		height: 100%;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		position: relative;
	}

	.bento-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-normal) var(--ease-out);
	}

	.bento-btn:hover img {
		transform: scale(1.03);
	}

	.bento-btn:focus-visible {
		outline: none;
		box-shadow: inset var(--focus-ring);
	}

	.bento-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 50%);
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		padding: var(--space-md);
		opacity: 0;
		transition: opacity var(--duration-fast) var(--ease-out);
	}

	.bento-btn:hover .bento-overlay {
		opacity: 1;
	}

	.bento-overlay svg {
		width: 20px;
		height: 20px;
		color: white;
	}

	.delete-btn {
		position: absolute;
		top: var(--space-sm);
		right: var(--space-sm);
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.bento-item:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		background: var(--color-error);
		border-color: var(--color-error);
		color: white;
	}

	.delete-btn svg {
		width: 14px;
		height: 14px;
	}

	.screenshot-dialog {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		max-width: none;
		max-height: none;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.screenshot-dialog::backdrop {
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
	}

	.screenshot-dialog[open] {
		display: flex;
	}

	.dialog-content {
		position: relative;
		max-width: 90vw;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.close-btn {
		position: absolute;
		top: -48px;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-md);
		color: white;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.close-btn svg {
		width: 20px;
		height: 20px;
	}

	.image-container {
		position: relative;
		display: flex;
		align-items: center;
	}

	.image-container img {
		max-width: 85vw;
		max-height: 80vh;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
	}

	.nav-btn {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-full);
		color: white;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.nav-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.nav-btn.prev {
		left: -64px;
	}

	.nav-btn.next {
		right: -64px;
	}

	.nav-btn svg {
		width: 24px;
		height: 24px;
	}

	.counter {
		margin-top: var(--space-md);
		padding: var(--space-xs) var(--space-md);
		background: rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-full);
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.caption {
		margin-top: var(--space-sm);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		text-align: center;
		max-width: 400px;
	}

	@media (max-width: 768px) {
		.bento-grid {
			grid-template-columns: 1fr;
			grid-auto-rows: 200px;
		}

		.bento-grid.has-many {
			grid-template-columns: 1fr;
		}

		.span-large,
		.span-medium,
		.span-small {
			grid-column: span 1;
			grid-row: span 1;
		}

		.nav-btn.prev {
			left: var(--space-md);
		}

		.nav-btn.next {
			right: var(--space-md);
		}
	}
</style>

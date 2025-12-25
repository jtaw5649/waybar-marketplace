<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		triggerText?: string;
		contentText?: string;
		delay?: number;
		closeDelay?: number;
		trigger?: import('svelte').Snippet;
		content?: import('svelte').Snippet;
	}

	let {
		triggerText = '',
		contentText = '',
		delay = 200,
		closeDelay = 150,
		trigger,
		content
	}: Props = $props();

	let isOpen = $state(false);
	let openTimer: ReturnType<typeof setTimeout> | null = null;
	let closeTimer: ReturnType<typeof setTimeout> | null = null;
	let wrapperRef = $state<HTMLDivElement | null>(null);
	let cardRef = $state<HTMLDivElement | null>(null);

	function clearTimers() {
		if (openTimer) {
			clearTimeout(openTimer);
			openTimer = null;
		}
		if (closeTimer) {
			clearTimeout(closeTimer);
			closeTimer = null;
		}
	}

	function handleMouseEnter() {
		clearTimers();
		openTimer = setTimeout(() => {
			isOpen = true;
		}, delay);
	}

	function handleMouseLeave() {
		clearTimers();
		closeTimer = setTimeout(() => {
			isOpen = false;
		}, closeDelay);
	}

	function handleCardMouseEnter() {
		clearTimers();
	}

	function handleCardMouseLeave() {
		handleMouseLeave();
	}

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		clearTimers();
		isOpen = !isOpen;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (!isOpen) return;
		const target = event.target as Node;
		const clickedInsideWrapper = wrapperRef?.contains(target);
		const clickedInsideCard = cardRef?.contains(target);
		if (!clickedInsideWrapper && !clickedInsideCard) {
			isOpen = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
			clearTimers();
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="hover-card-wrapper" bind:this={wrapperRef}>
	<div
		class="trigger"
		role="button"
		tabindex="0"
		aria-haspopup="true"
		aria-expanded={isOpen}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		onclick={handleClick}
		onkeydown={(e) => e.key === 'Enter' && handleClick(e as unknown as MouseEvent)}
	>
		{#if trigger}
			{@render trigger()}
		{:else}
			{triggerText}
		{/if}
	</div>

	{#if isOpen}
		<div
			class="hover-card"
			bind:this={cardRef}
			role="tooltip"
			onmouseenter={handleCardMouseEnter}
			onmouseleave={handleCardMouseLeave}
		>
			{#if content}
				{@render content()}
			{:else}
				{contentText}
			{/if}
		</div>
	{/if}
</div>

<style>
	.hover-card-wrapper {
		position: relative;
		display: inline-block;
	}

	.trigger {
		cursor: pointer;
	}

	.hover-card {
		position: absolute;
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		min-width: 240px;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		padding: var(--space-md);
		animation: hover-card-enter 0.2s ease-out;
	}

	@keyframes hover-card-enter {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hover-card {
			animation: none;
		}
	}
</style>

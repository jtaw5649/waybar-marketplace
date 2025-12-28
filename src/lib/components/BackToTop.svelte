<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		label?: string;
	}

	let { label = 'Back to top' }: Props = $props();
	let isVisible = $state(false);
	let revealOffset = $state(0);
	let prefersReducedMotion = $state(false);

	const getScrollTop = () =>
		window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

	const getMaxScroll = () =>
		Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

	const computeRevealOffset = () => {
		revealOffset = Math.max(200, Math.min(640, Math.round(window.innerHeight * 0.7)));
	};

	const updateVisibility = () => {
		const scrollTop = getScrollTop();
		const maxScroll = getMaxScroll();
		isVisible = scrollTop > revealOffset;
		if (!isVisible && maxScroll > 0 && scrollTop > maxScroll * 0.35) {
			isVisible = true;
		}
	};

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: prefersReducedMotion ? 'auto' : 'smooth'
		});
	}

	onMount(() => {
		const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = motionQuery?.matches ?? false;

		const updateMotion = (event: MediaQueryListEvent) => {
			prefersReducedMotion = event.matches;
		};

		const updateMeasurements = () => {
			computeRevealOffset();
			updateVisibility();
		};

		updateMeasurements();

		let ticking = false;
		const handleScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				ticking = false;
				updateVisibility();
			});
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		document.body?.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', updateMeasurements);

		if (motionQuery?.addEventListener) {
			motionQuery.addEventListener('change', updateMotion);
		} else if (motionQuery?.addListener) {
			motionQuery.addListener(updateMotion);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
			document.body?.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', updateMeasurements);

			if (motionQuery?.removeEventListener) {
				motionQuery.removeEventListener('change', updateMotion);
			} else if (motionQuery?.removeListener) {
				motionQuery.removeListener(updateMotion);
			}
		};
	});
</script>

<button
	class="back-to-top"
	class:visible={isVisible}
	data-back-to-top
	data-visible={isVisible ? 'true' : 'false'}
	aria-hidden={!isVisible}
	tabindex={isVisible ? 0 : -1}
	aria-label={label}
	title={label}
	type="button"
	onclick={scrollToTop}
>
	<svg
		class="icon"
		viewBox="0 0 24 24"
		width="18"
		height="18"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M12 19V5" />
		<path d="M5 12l7-7 7 7" />
	</svg>
	<span class="sr-only">{label}</span>
</button>

<style>
	.back-to-top {
		position: fixed;
		right: var(--space-lg);
		bottom: var(--space-lg);
		width: 44px;
		height: 44px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--color-primary) 75%, black);
		background: var(--color-primary);
		color: white;
		box-shadow: var(--shadow-lg);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transform: translateY(12px) scale(0.95);
		pointer-events: none;
		transition:
			opacity var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out),
			background var(--duration-fast) var(--ease-out);
		z-index: 900;
	}

	.back-to-top.visible {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
	}

	.back-to-top:hover {
		background: var(--color-primary-hover);
		box-shadow: var(--shadow-xl);
	}

	.back-to-top:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (max-width: 640px) {
		.back-to-top {
			right: var(--space-md);
			bottom: var(--space-md);
		}
	}
</style>

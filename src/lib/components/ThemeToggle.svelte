<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { theme } from '$lib/stores/theme';

	const themeState = fromStore(theme);
</script>

<button
	class="theme-toggle"
	onclick={theme.cycle}
	aria-label="Toggle theme (currently {themeState.current})"
	title="Theme: {themeState.current}"
>
	{#key themeState.current}
		<div class="icon-wrapper">
			{#if themeState.current === 'light'}
				<Sun size={18} />
			{:else if themeState.current === 'dark'}
				<Moon size={18} />
			{:else}
				<Monitor size={18} />
			{/if}
		</div>
	{/key}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		background: var(--color-bg-elevated);
		border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		border-radius: 9999px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			transform var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
		overflow: hidden;
	}

	.theme-toggle:hover {
		transform: scale(1.05);
		background-color: var(--color-bg-surface);
		border-color: var(--color-border);
		color: var(--color-text-normal);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.theme-toggle:focus-visible {
		box-shadow: var(--focus-ring);
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		animation: rotateIn 0.2s var(--ease-out);
	}

	@keyframes rotateIn {
		from {
			transform: rotate(-90deg);
			opacity: 0;
		}
		to {
			transform: rotate(0deg);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.icon-wrapper {
			animation: none;
		}

		.theme-toggle:hover,
		.theme-toggle:active {
			transform: none;
		}
	}
</style>

<script lang="ts">
	import { open as openCommandPalette } from '$lib/stores/commandPalette';
	import { platform, getModifierKey } from '$lib/stores/theme';
	import { TypeWriter } from 'svelte-typewrite';
	import { Search } from 'lucide-svelte';
	import { fromStore } from 'svelte/store';
	import Kbd from './Kbd.svelte';
	import KbdGroup from './KbdGroup.svelte';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
	}

	let { size = 'md' }: Props = $props();

	const placeholders = [
		'Search modules...',
		'Find workspace widgets...',
		'Discover system monitors...',
		'Explore network tools...',
		'Browse media controls...'
	];

	const platformState = fromStore(platform);
	const modifierKey = $derived(getModifierKey(platformState.current));

	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function handleClick() {
		openCommandPalette();
	}
</script>

<button
	type="button"
	class="search-trigger search-{size}"
	onclick={handleClick}
	aria-label="Open search"
>
	<div class="search-icon" aria-hidden="true">
		<Search size={18} />
	</div>
	<span class="search-placeholder" aria-hidden="true">
		{#if prefersReducedMotion}
			{placeholders[0]}
		{:else}
			<TypeWriter
				texts={placeholders}
				typeSpeed={70}
				deleteSpeed={35}
				afterTyped={{ wait: 1800 }}
				afterDeleted={{ wait: 150 }}
				repeat={0}
			/>
		{/if}
	</span>
	<div class="search-shortcut" aria-hidden="true">
		<KbdGroup>
			<Kbd>{modifierKey}</Kbd>
			<Kbd>⇧</Kbd>
			<Kbd>K</Kbd>
		</KbdGroup>
	</div>
</button>

<style>
	.search-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		min-width: 300px;
		max-width: 350px;
		padding: var(--space-md) var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		color: var(--color-text-faint);
		font-size: 0.9rem;
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.search-trigger:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-surface);
	}

	.search-trigger:focus {
		outline: none;
	}

	.search-trigger:focus-visible {
		border-color: var(--color-primary);
	}

	.search-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.search-placeholder {
		flex: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		contain: content;
		will-change: contents;
	}

	.search-placeholder :global(span > span) {
		display: none;
	}

	.search-shortcut {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.search-sm {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.85rem;
	}

	.search-sm .search-icon :global(svg) {
		width: 16px;
		height: 16px;
	}

	.search-lg {
		padding: var(--space-lg) var(--space-xl);
		font-size: 1rem;
	}

	.search-lg .search-icon :global(svg) {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 768px) {
		.search-shortcut {
			display: none;
		}
	}
</style>

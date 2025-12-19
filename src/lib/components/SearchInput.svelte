<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { registerSearchInput, unregisterSearchInput } from '$lib/stores/search';

	interface Props {
		value?: string;
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		autofocus?: boolean;
		debounce?: number;
		onsubmit?: (query: string) => void;
		oninput?: (query: string) => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search modules...',
		size = 'md',
		autofocus = false,
		debounce = 0,
		onsubmit,
		oninput
	}: Props = $props();

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleInput() {
		if (!oninput) return;

		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		if (debounce > 0) {
			debounceTimer = setTimeout(() => {
				oninput(value);
			}, debounce);
		} else {
			oninput(value);
		}
	}

	const placeholders = [
		'Search modules...',
		'Find workspace widgets...',
		'Discover system monitors...',
		'Explore network tools...',
		'Browse media controls...'
	];

	let displayPlaceholder = $state('');
	let placeholderIndex = $state(0);
	let charIndex = $state(0);
	let isDeleting = $state(false);
	let isFocused = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);

	onMount(() => {
		displayPlaceholder = placeholder;
		registerSearchInput(() => inputRef?.focus());

		if (autofocus && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			inputRef?.focus();
		}

		return () => {
			unregisterSearchInput();
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});

	$effect(() => {
		if (isFocused || value) return;

		const typeSpeed = isDeleting ? 30 : 80;
		const pauseTime =
			isDeleting && charIndex === 0
				? 500
				: isDeleting
					? 0
					: charIndex === placeholders[placeholderIndex].length
						? 2000
						: 0;

		const timeout = setTimeout(() => {
			if (!isDeleting && charIndex === placeholders[placeholderIndex].length) {
				isDeleting = true;
			} else if (isDeleting && charIndex === 0) {
				isDeleting = false;
				placeholderIndex = (placeholderIndex + 1) % placeholders.length;
			} else {
				charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
				displayPlaceholder = placeholders[placeholderIndex].slice(0, charIndex);
			}
		}, pauseTime || typeSpeed);

		return () => clearTimeout(timeout);
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (onsubmit) {
			onsubmit(value);
		} else if (value.trim()) {
			goto(`/browse?q=${encodeURIComponent(value.trim())}`);
		}
	}

	function handleFocus() {
		isFocused = true;
		displayPlaceholder = placeholders[0];
	}

	function handleBlur() {
		isFocused = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			(e.target as HTMLInputElement).blur();
		}
	}
</script>

<form class="search-form search-{size}" onsubmit={handleSubmit}>
	<div class="search-icon" aria-hidden="true">
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	</div>
	<input
		type="search"
		bind:this={inputRef}
		bind:value
		placeholder={displayPlaceholder}
		class="search-input"
		onfocus={handleFocus}
		onblur={handleBlur}
		onkeydown={handleKeydown}
		oninput={handleInput}
		aria-label="Search modules"
	/>
	<div id="search-shortcut-hint" class="search-shortcut" aria-hidden="true">
		<kbd>⌘</kbd><kbd>⇧</kbd><kbd>K</kbd>
	</div>
</form>

<style>
	.search-form {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		max-width: 480px;
	}

	.search-icon {
		position: absolute;
		left: var(--space-md);
		color: var(--color-text-faint);
		pointer-events: none;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		color: var(--color-text-normal);
		font-size: 0.9rem;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.search-input::placeholder {
		color: var(--color-text-faint);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--focus-ring);
		background-color: var(--color-bg-base);
	}

	.search-input::-webkit-search-cancel-button {
		-webkit-appearance: none;
	}

	.search-shortcut {
		position: absolute;
		right: var(--space-md);
		display: flex;
		gap: 2px;
		pointer-events: none;
	}

	.search-shortcut kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 22px;
		padding: 0 var(--space-xs);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		font-family: inherit;
		color: var(--color-text-faint);
	}

	.search-sm .search-input {
		padding: var(--space-sm) var(--space-lg);
		padding-left: 38px;
		padding-right: 60px;
		font-size: 0.85rem;
	}

	.search-sm .search-icon {
		left: var(--space-sm);
	}

	.search-sm .search-icon svg {
		width: 16px;
		height: 16px;
	}

	.search-md .search-input {
		padding: var(--space-md) var(--space-xl);
		padding-left: 44px;
		padding-right: 70px;
	}

	.search-lg .search-input {
		padding: var(--space-lg) var(--space-xl);
		padding-left: 48px;
		padding-right: 80px;
		font-size: 1rem;
	}

	.search-lg .search-icon {
		left: var(--space-lg);
	}

	.search-lg .search-icon svg {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 768px) {
		.search-shortcut {
			display: none;
		}

		.search-input {
			padding-right: var(--space-lg) !important;
		}
	}
</style>

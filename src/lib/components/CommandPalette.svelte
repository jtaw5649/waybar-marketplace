<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { isOpen, mode, query, close, setMode, setQuery } from '$lib/stores/commandPalette';
	import { fuzzySearch } from '$lib/utils/fuzzySearch';

	import type { PaletteMode, PaletteItem } from '$lib/types';
	import type { Session } from '@auth/sveltekit';

	interface Props {
		session?: Session | null;
		isAdmin?: boolean;
	}

	let { session = null, isAdmin = false }: Props = $props();

	interface PaletteResult {
		item: PaletteItem;
		score: number;
		highlights: Record<string, string>;
	}

	const isAuthenticated = $derived(!!session?.user);

	interface PageItemWithAuth extends PaletteItem {
		requiresAuth?: boolean;
		requiresAdmin?: boolean;
		hideWhenAuth?: boolean;
	}

	const allPages: PageItemWithAuth[] = [
		{
			id: 'home',
			name: 'Home',
			description: 'Go to homepage',
			type: 'page',
			path: '/',
			icon: 'home'
		},
		{
			id: 'get-started',
			name: 'Get Started',
			description: 'Install Barforge App',
			type: 'page',
			path: 'https://github.com/jtaw5649/barforge-app',
			icon: 'download'
		},
		{
			id: 'docs',
			name: 'Waybar Docs',
			description: 'Read the official Waybar docs',
			type: 'page',
			path: 'https://github.com/Alexays/Waybar',
			icon: 'external'
		},
		{
			id: 'dashboard',
			name: 'Dashboard',
			description: 'Your personal dashboard',
			type: 'page',
			path: '/dashboard',
			icon: 'dashboard',
			requiresAuth: true
		},
		{
			id: 'admin',
			name: 'Admin Panel',
			description: 'Administration settings',
			type: 'page',
			path: '/admin',
			icon: 'settings',
			requiresAuth: true,
			requiresAdmin: true
		},
		{
			id: 'login',
			name: 'Login',
			description: 'Log in to your account',
			type: 'page',
			path: '/login',
			icon: 'login',
			hideWhenAuth: true
		}
	];

	const pages = $derived(
		allPages.filter((page) => {
			if (page.hideWhenAuth && isAuthenticated) return false;
			if (page.requiresAuth && !isAuthenticated) return false;
			if (page.requiresAdmin && !isAdmin) return false;
			return true;
		}) as PaletteItem[]
	);

	const commands: PaletteItem[] = [
		{
			id: 'copy-url',
			name: 'Copy Current URL',
			description: 'Copy page URL to clipboard',
			type: 'command',
			icon: 'copy',
			action: () => navigator.clipboard.writeText(window.location.href)
		},
		{
			id: 'refresh',
			name: 'Refresh Page',
			description: 'Reload the current page',
			type: 'command',
			icon: 'refresh',
			action: () => window.location.reload()
		}
	];

	let inputRef: HTMLInputElement | null = $state(null);
	let selectedIndex = $state(0);
	let dialogEl: HTMLDivElement | null = $state(null);
	let triggerEl: HTMLElement | null = null;

	interface SearchableItem {
		id: string;
		name: string;
		description?: string;
		[key: string]: unknown;
	}

	const allItems = $derived([...pages, ...commands] as PaletteItem[]);

	const filteredByMode = $derived.by(() => {
		if ($mode === 'all') return allItems;
		if ($mode === 'pages') return pages;
		return commands;
	});

	const results = $derived.by((): PaletteResult[] => {
		const items = filteredByMode as (SearchableItem & PaletteItem)[];
		if (!$query.trim())
			return items.map((item: PaletteItem) => ({ item, score: 0, highlights: {} }));
		return fuzzySearch(items, $query) as PaletteResult[];
	});

	$effect(() => {
		if ($isOpen) {
			triggerEl = document.activeElement as HTMLElement;
			fetchModules();
			selectedIndex = 0;
			requestAnimationFrame(() => inputRef?.focus());
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	});

	$effect(() => {
		void $query;
		selectedIndex = 0;
	});

	async function fetchModules() {
		return;
	}

	function trapFocus(e: KeyboardEvent) {
		const focusable = dialogEl?.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (!focusable?.length) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function handleClose() {
		close();
		triggerEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			handleClose();
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
			scrollToSelected();
			return;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
			scrollToSelected();
			return;
		}

		if (e.key === 'Enter' && results[selectedIndex]) {
			e.preventDefault();
			executeItem(results[selectedIndex].item);
			return;
		}

		if (e.key === 'Tab') {
			if (e.altKey) {
				e.preventDefault();
				const modes: PaletteMode[] = ['all', 'pages', 'commands'];
				const currentIdx = modes.indexOf($mode);
				const nextIdx = e.shiftKey
					? (currentIdx - 1 + modes.length) % modes.length
					: (currentIdx + 1) % modes.length;
				setMode(modes[nextIdx]);
			} else {
				trapFocus(e);
			}
		}
	}

	function scrollToSelected() {
		const el = dialogEl?.querySelector(`[data-index="${selectedIndex}"]`);
		el?.scrollIntoView({ block: 'nearest' });
	}

	function executeItem(item: PaletteItem) {
		close();
		if (item.action) {
			item.action();
		} else if (item.path) {
			goto(item.path);
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) handleClose();
	}

	function getIcon(icon?: string) {
		const icons: Record<string, string> = {
			home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
			grid: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
			upload: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
			dashboard:
				'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			settings:
				'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
			login:
				'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
			copy: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
			refresh:
				'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
		};
		return icons[icon || 'grid'] || icons.grid;
	}

	function getTypeLabel(type: string) {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}
</script>

{#if $isOpen}
	<div
		class="palette-backdrop"
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div
			bind:this={dialogEl}
			class="palette"
			transition:scale={{ duration: 150, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			onkeydown={handleKeydown}
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			tabindex="-1"
		>
			<div class="palette-header">
				<div class="search-wrapper">
					<svg
						class="search-icon"
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
					<input
						bind:this={inputRef}
						type="text"
						autocomplete="off"
						value={$query}
						oninput={(e) => setQuery(e.currentTarget.value)}
						placeholder="Find pages and commands..."
						class="search-input"
						role="combobox"
						aria-label="Find pages and commands"
						aria-haspopup="listbox"
						aria-expanded={results.length > 0}
						aria-controls="palette-results"
						aria-activedescendant={results.length > 0
							? `palette-option-${selectedIndex}`
							: undefined}
						aria-autocomplete="list"
					/>
				</div>
				<div class="mode-chips">
					{#each ['all', 'pages', 'commands'] as m (m)}
						<button
							class="chip"
							class:active={$mode === m}
							onclick={() => setMode(m as PaletteMode)}
						>
							{m === 'all' ? 'All' : m.charAt(0).toUpperCase() + m.slice(1)}
						</button>
					{/each}
				</div>
			</div>

			<div class="palette-results" role="listbox" id="palette-results" aria-label="Results">
				{#if results.length === 0}
					<div class="no-results" role="status">
						<span class="no-results-text">No results found</span>
					</div>
				{:else}
					{#each results as result, i (result.item.id)}
						<button
							class="result-item"
							class:selected={i === selectedIndex}
							id={`palette-option-${i}`}
							role="option"
							aria-selected={i === selectedIndex}
							data-index={i}
							onclick={() => executeItem(result.item)}
							onmouseenter={() => (selectedIndex = i)}
						>
							<div class="result-icon">
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path d={getIcon(result.item.icon)} />
								</svg>
							</div>
							<div class="result-content">
								<span class="result-name">{result.item.name}</span>
								{#if result.item.description}
									<span class="result-description">{result.item.description}</span>
								{/if}
							</div>
							<span class="result-type">{getTypeLabel(result.item.type)}</span>
						</button>
					{/each}
				{/if}
			</div>

			<div class="palette-footer">
				<div class="hint">
					<kbd>↑</kbd><kbd>↓</kbd>
					<span>Navigate</span>
				</div>
				<div class="hint">
					<kbd>↵</kbd>
					<span>Select</span>
				</div>
				<div class="hint">
					<kbd>Alt+Tab</kbd>
					<span>Filter</span>
				</div>
				<div class="hint">
					<kbd>Esc</kbd>
					<span>Close</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.palette-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: var(--space-xl);
		padding-top: min(15vh, 80px);
		z-index: 1000;
	}

	.palette {
		width: min(560px, 100%);
		max-height: calc(100vh - min(15vh, 80px) - var(--space-2xl));
		display: flex;
		flex-direction: column;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.1),
			0 8px 32px rgba(0, 0, 0, 0.5),
			0 16px 64px rgba(0, 0, 0, 0.3);
		overflow: hidden;
	}

	.palette-header {
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--space-lg);
		color: var(--color-text-faint);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-md) var(--space-lg);
		padding-left: 48px;
		background: var(--color-bg-elevated);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-normal);
		font-size: 1rem;
		box-shadow: inset 0 0 0 1px var(--color-border);
		transition: box-shadow var(--duration-fast) var(--ease-out);
	}

	.search-input::placeholder {
		color: var(--color-text-faint);
	}

	.search-input:focus {
		outline: none;
		box-shadow:
			inset 0 0 0 1px var(--color-primary),
			0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
	}

	.mode-chips {
		display: flex;
		gap: var(--space-xs);
		margin-top: var(--space-md);
	}

	.chip {
		padding: 6px var(--space-md);
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.chip:hover {
		background: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.chip.active {
		background: var(--color-bg-elevated);
		color: var(--color-text-normal);
		box-shadow: inset 0 0 0 1px var(--color-border);
	}

	.palette-header {
		flex-shrink: 0;
	}

	.palette-results {
		flex: 1;
		min-height: 0;
		max-height: 360px;
		overflow-y: auto;
		padding: var(--space-sm) 0;
	}

	.palette-results::-webkit-scrollbar {
		width: 8px;
	}

	.palette-results::-webkit-scrollbar-track {
		background: transparent;
	}

	.palette-results::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 4px;
	}

	.palette-results::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-faint);
	}

	.no-results {
		padding: var(--space-2xl);
		text-align: center;
	}

	.no-results-text {
		color: var(--color-text-faint);
		font-size: 0.9rem;
	}

	.result-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-sm) var(--space-lg);
		margin: 0 var(--space-sm);
		width: calc(100% - var(--space-lg));
		background: none;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-normal);
		text-align: left;
		cursor: pointer;
	}

	.result-item.selected::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 2px;
		height: 60%;
		background: var(--color-primary);
		border-radius: 1px;
	}

	.result-item.selected {
		background: var(--color-bg-elevated);
	}

	.result-item.selected .result-icon {
		background: rgba(97, 125, 250, 0.15);
		color: var(--color-primary);
	}

	.result-item.selected .result-name {
		color: var(--color-text-normal);
	}

	.result-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: var(--color-bg-surface);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.result-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.result-name {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-description {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.result-type {
		flex-shrink: 0;
		padding: 3px var(--space-sm);
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.65rem;
		color: var(--color-text-faint);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.palette-footer {
		flex-shrink: 0;
		display: flex;
		gap: var(--space-xl);
		padding: var(--space-md) var(--space-lg);
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-elevated);
	}

	.hint {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.hint kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 22px;
		padding: 0 6px;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		font-family: inherit;
		color: var(--color-text-muted);
	}

	@media (max-width: 600px) {
		.palette-backdrop {
			padding-top: 0;
			align-items: flex-start;
		}

		.palette {
			width: 100vw;
			max-height: 100vh;
			border-radius: 0;
		}

		.palette-footer {
			flex-wrap: wrap;
			gap: var(--space-sm);
		}
	}
</style>

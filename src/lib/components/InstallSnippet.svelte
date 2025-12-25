<script lang="ts">
	import { onMount } from 'svelte';
	import { Copy, Check } from 'lucide-svelte';
	import Icon from './Icon.svelte';
	import Kbd from './Kbd.svelte';
	import KbdGroup from './KbdGroup.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	const COPY_RESET_MS = 1200;

	const installMethods = [
		{
			id: 'shell',
			label: 'Shell',
			icon: 'simple-icons:gnubash',
			color: '#4EAA25',
			command:
				"curl -sSL https://api.barforge.dev/install | sh"
		},
		{
			id: 'aur',
			label: 'AUR',
			icon: 'simple-icons:archlinux',
			color: '#1793D1',
			command: 'yay -S barforge'
		},
		{
			id: 'source',
			label: 'Source',
			icon: 'simple-icons:rust',
			color: '#DEA584',
			command:
				'git clone https://github.com/jtaw5649/barforge-app && cd barforge-app && cargo build --release'
		}
	];

	let activeTab = $state('aur');
	let copied = $state(false);
	let expanded = $state(false);
	let hovered = $state(false);
	let isMouseInSection = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	const activeMethod = $derived(installMethods.find((m) => m.id === activeTab));
	const activeCommand = $derived(activeMethod?.command ?? '');
	const activeColor = $derived(activeMethod?.color ?? '#cba6f7');

	function handleExpand() {
		expanded = !expanded;
	}

	async function handleCopy() {
		if (copied) return;

		try {
			await navigator.clipboard.writeText(activeCommand);
			copied = true;

			if (copyTimeout) clearTimeout(copyTimeout);
			copyTimeout = setTimeout(() => {
				copied = false;
			}, COPY_RESET_MS);
		} catch {
			toast.error('Failed to copy to clipboard');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isMouseInSection) return;
		if (!e.ctrlKey) return;
		if (e.key !== 'c' && e.key !== 'C') return;

		const target = e.target as HTMLElement;
		if (['INPUT', 'TEXTAREA'].includes(target?.tagName || '')) return;

		const selection = window.getSelection();
		if (selection && selection.toString().length > 0) return;

		e.preventDefault();
		handleCopy();
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			if (copyTimeout) clearTimeout(copyTimeout);
		};
	});
</script>

<section
	class="tui-panel install-snippet"
	aria-label="Install methods"
	onmouseenter={() => (isMouseInSection = true)}
	onmouseleave={() => (isMouseInSection = false)}
>
	<div class="tui-panel-header">
		<span class="tui-panel-title">[ INSTALL ]</span>
	</div>

	<div class="install-tabs" role="tablist">
		{#each installMethods as method (method.id)}
			<button
				role="tab"
				aria-selected={activeTab === method.id}
				class="install-tab"
				class:active={activeTab === method.id}
				style="--tab-color: {method.color}"
				onclick={() => (activeTab = method.id)}
			>
				<Icon name={method.icon} size={16} />
				<span>{method.label}</span>
			</button>
		{/each}
	</div>

	<div class="tui-panel-body">
		<div class="terminal-window" role="tabpanel" style="--terminal-accent: {activeColor}">
			<div class="terminal-header">
				<span class="terminal-dot"></span>
				<span class="terminal-dot"></span>
				<span class="terminal-dot"></span>
				<span class="terminal-title">Install barforge</span>
			</div>
			<div
				class="terminal-body"
				role="button"
				tabindex="0"
				aria-label="Toggle command expansion"
				onclick={handleExpand}
				onkeydown={(e) => e.key === 'Enter' && handleExpand()}
				onmouseenter={() => (hovered = true)}
				onmouseleave={() => (hovered = false)}
			>
				<span class="terminal-prompt">$</span>
				<code class="terminal-cmd" class:show-full={expanded || hovered}>{activeCommand}</code>
				<div class="terminal-actions">
					<KbdGroup>
						<Kbd>Ctrl</Kbd>
						<Kbd>C</Kbd>
					</KbdGroup>
					<button
						class="copy-btn"
						class:copied
						onclick={(e) => {
							e.stopPropagation();
							handleCopy();
						}}
						aria-label={copied ? 'Copied' : 'Copy to clipboard'}
						disabled={copied}
					>
						{#if copied}
							<Check size={14} />
							<span>Copied!</span>
						{:else}
							<Copy size={14} />
							<span>Copy</span>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.install-snippet {
		overflow-x: hidden;
	}

	.install-tabs {
		display: flex;
		gap: 1px;
		background: var(--color-border);
		margin: var(--space-md) var(--space-lg) 0;
	}

	:global(.install-snippet .terminal-window) {
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	:global(.install-snippet .terminal-body) {
		width: 100%;
		box-sizing: border-box;
		min-height: 52px;
		height: 52px;
	}

	:global(.install-snippet .terminal-body:has(.show-full)) {
		height: auto;
		min-height: 52px;
	}

	.install-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-bg-surface);
		border: none;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		cursor: pointer;
		position: relative;
		transition:
			background var(--duration-fast),
			color var(--duration-fast);
	}

	.install-tab:hover {
		background: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.install-tab.active {
		background: var(--color-bg-base);
		color: var(--tab-color, var(--color-primary));
		border-bottom-color: transparent;
	}

	.install-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--tab-color, var(--color-primary));
	}

	.install-tab :global(svg) {
		transition: color var(--duration-fast);
	}

	.install-tab.active :global(svg) {
		color: var(--tab-color);
	}

	.terminal-actions {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-left: auto;
		flex-shrink: 0;
	}

	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-faint);
		font-size: 0.75rem;
		font-family: var(--font-mono);
		cursor: pointer;
		transition:
			color var(--duration-fast),
			border-color var(--duration-fast),
			background var(--duration-fast);
	}

	.copy-btn:hover:not(:disabled) {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.copy-btn:focus-visible {
		box-shadow: var(--focus-ring);
		outline: none;
	}

	.copy-btn.copied {
		border-color: var(--color-success);
		color: var(--color-success);
		background: color-mix(in srgb, var(--color-success) 10%, transparent);
	}

	.copy-btn:disabled {
		cursor: default;
	}

	.terminal-cmd {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.terminal-cmd.show-full {
		white-space: normal;
		word-break: break-all;
	}

	@media (max-width: 640px) {
		.terminal-actions :global([data-slot="kbd-group"]) {
			display: none;
		}
	}

	@media (max-width: 400px) {
		.install-tabs {
			margin: var(--space-sm) var(--space-sm) 0;
		}

		.install-tab {
			padding: var(--space-sm);
			font-size: 0.75rem;
		}

		.install-tab span {
			display: none;
		}
	}
</style>

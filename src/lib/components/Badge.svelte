<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'primary' | 'success' | 'warning' | 'info' | 'outline' | 'version';
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		variant?: Variant;
		size?: Size;
		dot?: boolean;
		live?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		variant = 'default',
		size = 'md',
		dot = false,
		live = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<span
	class="badge badge-{variant} badge-{size} {className}"
	class:has-dot={dot}
	role={live ? 'status' : undefined}
>
	{#if dot}
		<span class="dot" aria-hidden="true"></span>
	{/if}
	{@render children?.()}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-weight: 500;
		border-radius: 9999px;
		white-space: nowrap;
	}

	.badge-sm {
		padding: 2px 8px;
		font-size: 0.625rem;
	}
	.badge-md {
		padding: 4px 10px;
		font-size: 0.75rem;
	}
	.badge-lg {
		padding: 6px 12px;
		font-size: 0.8rem;
	}

	.badge-default {
		background: var(--color-bg-elevated);
		color: var(--color-text-muted);
	}

	.badge-primary {
		background: rgba(97, 125, 250, 0.15);
		color: var(--color-primary);
	}

	.badge-success {
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-success);
	}

	.badge-warning {
		background: rgba(245, 158, 11, 0.15);
		color: var(--color-warning);
	}

	.badge-info {
		background: rgba(139, 92, 246, 0.15);
		color: var(--color-info);
	}

	.badge-outline {
		background: transparent;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}

	.badge-version {
		background: rgba(6, 182, 212, 0.15);
		color: #22d3ee;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}
</style>

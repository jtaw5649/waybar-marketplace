<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		disabled?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		loading = false,
		disabled = false,
		href,
		type = 'button',
		onclick,
		children
	}: Props = $props();

	const isDisabled = $derived(disabled || loading);
</script>

{#if href && !isDisabled}
	<a {href} class="btn btn-{variant} btn-{size}" class:loading>
		{#if loading}
			<svg
				class="spinner"
				viewBox="0 0 24 24"
				width="16"
				height="16"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
				<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
			</svg>
		{/if}
		<span class="btn-content" class:hidden={loading}>
			{@render children()}
		</span>
	</a>
{:else}
	<button class="btn btn-{variant} btn-{size}" class:loading {type} disabled={isDisabled} {onclick}>
		{#if loading}
			<svg
				class="spinner"
				viewBox="0 0 24 24"
				width="16"
				height="16"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
				<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
			</svg>
		{/if}
		<span class="btn-content" class:hidden={loading}>
			{@render children()}
		</span>
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		font-weight: 500;
		border-radius: var(--radius-md);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		position: relative;
	}

	.btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-sm {
		padding: var(--space-xs) var(--space-md);
		font-size: 0.8125rem;
	}

	.btn-md {
		padding: var(--space-sm) var(--space-lg);
		font-size: 0.875rem;
	}

	.btn-lg {
		padding: var(--space-md) var(--space-xl);
		font-size: 1rem;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
		border: 1px solid var(--color-primary);
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-hover, #5068d9);
		border-color: var(--color-primary-hover, #5068d9);
	}

	.btn-secondary {
		background-color: var(--color-bg-surface);
		color: var(--color-text-muted);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-primary);
		color: var(--color-text-normal);
	}

	.btn-ghost {
		background-color: transparent;
		color: var(--color-text-muted);
		border: 1px solid transparent;
	}

	.btn-ghost:hover:not(:disabled) {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
	}

	.btn-outline {
		background-color: transparent;
		color: var(--color-primary);
		border: 1px solid var(--color-primary);
	}

	.btn-outline:hover:not(:disabled) {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-destructive {
		background-color: var(--color-error);
		color: white;
		border: 1px solid var(--color-error);
	}

	.btn-destructive:hover:not(:disabled) {
		background-color: #dc2626;
		border-color: #dc2626;
	}

	.btn-content {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.btn-content.hidden {
		visibility: hidden;
	}

	.loading {
		position: relative;
	}

	.spinner {
		position: absolute;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>

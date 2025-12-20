<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast.svelte';

	interface Props {
		text: string;
		class?: string;
	}

	let { text, class: className = '' }: Props = $props();
	let copied = $state(false);
	let failed = $state(false);
	let timeoutRef: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		return () => {
			if (timeoutRef) clearTimeout(timeoutRef);
		};
	});

	async function copy() {
		failed = false;
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			if (timeoutRef) clearTimeout(timeoutRef);
			timeoutRef = setTimeout(() => (copied = false), 1500);
		} catch {
			failed = true;
			toast.error('Failed to copy to clipboard');
			if (timeoutRef) clearTimeout(timeoutRef);
			timeoutRef = setTimeout(() => (failed = false), 1500);
		}
	}
</script>

<button
	class="copy-btn {className}"
	class:failed
	onclick={copy}
	aria-label={copied ? 'Copied' : failed ? 'Copy failed' : 'Copy to clipboard'}
	disabled={copied || failed}
>
	<span class="icon-container">
		<svg
			class="icon copy-icon"
			class:hidden={copied || failed}
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<rect x="9" y="9" width="13" height="13" rx="2" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		</svg>
		<svg
			class="icon check-icon"
			class:visible={copied}
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
		<svg
			class="icon error-icon"
			class:visible={failed}
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	</span>
	<span class="label">{copied ? 'Copied!' : failed ? 'Failed' : 'Copy'}</span>
</button>

<style>
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		cursor: pointer;
		transition: background var(--duration-fast);
	}

	.copy-btn:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.copy-btn:focus-visible {
		box-shadow: var(--focus-ring);
		outline: none;
	}

	.copy-btn:disabled {
		cursor: default;
	}

	.icon-container {
		position: relative;
		width: 16px;
		height: 16px;
	}

	.icon {
		position: absolute;
		inset: 0;
		transition:
			opacity var(--duration-fast),
			transform var(--duration-fast);
	}

	.copy-icon {
		opacity: 1;
		transform: scale(1);
	}
	.copy-icon.hidden {
		opacity: 0;
		transform: scale(0.6);
	}

	.check-icon {
		opacity: 0;
		transform: scale(0.6);
		stroke: var(--color-success);
	}
	.check-icon.visible {
		opacity: 1;
		transform: scale(1);
	}

	.error-icon {
		opacity: 0;
		transform: scale(0.6);
		stroke: white;
	}
	.error-icon.visible {
		opacity: 1;
		transform: scale(1);
	}

	.copy-btn.failed {
		background: var(--color-error);
	}
</style>

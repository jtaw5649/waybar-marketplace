<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		title: string;
		size?: 'sm' | 'md' | 'lg';
		onclose?: () => void;
		children?: Snippet;
		footer?: Snippet;
	}

	let { open, title, size = 'md', onclose, children, footer }: Props = $props();

	let dialogEl: HTMLDialogElement | undefined = $state(undefined);
	let previousActiveElement: HTMLElement | null = null;

	function close() {
		onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
		if (e.key === 'Tab') trapFocus(e);
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

	$effect(() => {
		if (open) {
			previousActiveElement = document.activeElement as HTMLElement;
			document.body.style.overflow = 'hidden';
			requestAnimationFrame(() => dialogEl?.querySelector<HTMLElement>('button, input')?.focus());
		} else {
			document.body.style.overflow = '';
			previousActiveElement?.focus();
		}
	});
</script>

{#if open}
	<div
		class="modal-backdrop"
		transition:fade={{ duration: 200 }}
		onclick={close}
		onkeydown={handleKeydown}
		role="presentation"
	>
		<dialog
			bind:this={dialogEl}
			class="modal modal-{size}"
			transition:scale={{ duration: 200, start: 0.95 }}
			open
			aria-modal="true"
			aria-labelledby="modal-title"
			onclick={(e) => e.stopPropagation()}
		>
			<header class="modal-header">
				<h2 id="modal-title">{title}</h2>
				<button class="close-btn" onclick={close} aria-label="Close">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			</header>
			<div class="modal-body">
				{@render children?.()}
			</div>
			{#if footer}
				<footer class="modal-footer">
					{@render footer()}
				</footer>
			{/if}
		</dialog>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		max-height: 85vh;
		overflow: auto;
	}

	.modal-sm {
		width: min(400px, 90vw);
	}
	.modal-md {
		width: min(560px, 90vw);
	}
	.modal-lg {
		width: min(800px, 90vw);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
	}

	.close-btn:hover {
		color: var(--color-text-normal);
	}

	.close-btn:focus-visible {
		box-shadow: var(--focus-ring);
	}

	.modal-body {
		padding: var(--space-lg);
	}

	.modal-footer {
		padding: var(--space-lg);
		border-top: 1px solid var(--color-border);
	}
</style>

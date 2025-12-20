<script lang="ts">
	import { fly } from 'svelte/transition';
	import { fromStore } from 'svelte/store';
	import { toast } from '$lib/stores/toast';

	const toastState = fromStore(toast);

	const icons = {
		success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg>`,
		error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
		warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
		info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
	};
</script>

{#if toastState.current.length > 0}
	<div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
		{#each toastState.current as t (t.id)}
			<div
				class="toast toast-{t.variant}"
				class:toast-paused={t.isPaused}
				role="alert"
				transition:fly={{ x: 100, duration: 200 }}
				onmouseenter={() => toast.pause(t.id)}
				onmouseleave={() => toast.resume(t.id)}
			>
				<span class="toast-icon" aria-hidden="true">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html icons[t.variant]}
				</span>
				<span class="toast-message">{t.message}</span>
				<button
					class="toast-close"
					onclick={() => toast.remove(t.id)}
					aria-label="Dismiss notification"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
				{#if t.duration > 0}
					<div
						class="toast-progress toast-progress-{t.variant}"
						style="animation-duration: {t.duration}ms"
					></div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: var(--space-lg);
		right: var(--space-lg);
		z-index: 1000;
		display: flex;
		flex-direction: column-reverse;
		gap: var(--space-sm);
		max-width: 380px;
		width: 100%;
		pointer-events: none;
	}

	.toast {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		pointer-events: auto;
		overflow: hidden;
	}

	.toast-success {
		border-left: 3px solid var(--color-success);
	}

	.toast-success .toast-icon {
		color: var(--color-success);
	}

	.toast-error {
		border-left: 3px solid var(--color-error);
	}

	.toast-error .toast-icon {
		color: var(--color-error);
	}

	.toast-warning {
		border-left: 3px solid var(--color-warning);
	}

	.toast-warning .toast-icon {
		color: var(--color-warning);
	}

	.toast-info {
		border-left: 3px solid var(--color-info);
	}

	.toast-info .toast-icon {
		color: var(--color-info);
	}

	.toast-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		margin-top: 1px;
	}

	.toast-message {
		flex: 1;
		font-size: 0.875rem;
		color: var(--color-text-normal);
		line-height: 1.5;
	}

	.toast-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xs);
		background: none;
		border: none;
		color: var(--color-text-faint);
		cursor: pointer;
		border-radius: var(--radius-sm);
		margin: -4px -4px -4px 0;
	}

	.toast-close:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.toast-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		width: 100%;
		animation: countdown linear forwards;
	}

	.toast-progress-success {
		background-color: var(--color-success);
	}

	.toast-progress-error {
		background-color: var(--color-error);
	}

	.toast-progress-warning {
		background-color: var(--color-warning);
	}

	.toast-progress-info {
		background-color: var(--color-info);
	}

	.toast-paused .toast-progress {
		animation-play-state: paused;
	}

	@keyframes countdown {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}

	@media (max-width: 480px) {
		.toast-container {
			bottom: var(--space-md);
			right: var(--space-md);
			left: var(--space-md);
			max-width: none;
		}
	}
</style>

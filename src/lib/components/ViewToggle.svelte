<script lang="ts">
	import { viewMode, type ViewMode } from '$lib/stores/viewMode';

	let currentMode = $state<ViewMode>('grid');

	$effect(() => {
		const unsubscribe = viewMode.subscribe((value) => {
			currentMode = value;
		});
		return unsubscribe;
	});

	function setMode(mode: ViewMode) {
		viewMode.set(mode);
	}
</script>

<div class="view-toggle" role="group" aria-label="View mode">
	<button
		class="view-btn"
		class:active={currentMode === 'grid'}
		onclick={() => setMode('grid')}
		aria-pressed={currentMode === 'grid'}
		aria-label="Grid view"
		title="Grid view"
	>
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</svg>
	</button>
	<button
		class="view-btn"
		class:active={currentMode === 'list'}
		onclick={() => setMode('list')}
		aria-pressed={currentMode === 'list'}
		aria-label="List view"
		title="List view"
	>
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<line x1="8" y1="6" x2="21" y2="6" />
			<line x1="8" y1="12" x2="21" y2="12" />
			<line x1="8" y1="18" x2="21" y2="18" />
			<circle cx="4" cy="6" r="1" fill="currentColor" />
			<circle cx="4" cy="12" r="1" fill="currentColor" />
			<circle cx="4" cy="18" r="1" fill="currentColor" />
		</svg>
	</button>
</div>

<style>
	.view-toggle {
		display: flex;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.view-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.view-btn:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.view-btn.active {
		background-color: var(--color-primary);
		color: white;
	}

	.view-btn:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		z-index: 1;
	}

	.view-btn + .view-btn {
		border-left: 1px solid var(--color-border);
	}

	.view-btn.active + .view-btn,
	.view-btn + .view-btn.active {
		border-left-color: transparent;
	}
</style>

<script lang="ts">
	import { sidebarCollapsed } from '$lib/stores/sidebar';

	let collapsed = $state(false);

	$effect(() => {
		const unsubscribe = sidebarCollapsed.subscribe((value) => {
			collapsed = value;
		});
		return unsubscribe;
	});

	function toggle() {
		sidebarCollapsed.toggle();
	}
</script>

<button
	class="sidebar-toggle"
	onclick={toggle}
	aria-expanded={!collapsed}
	aria-controls="filter-sidebar"
	aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
	title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
>
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
		class:rotated={collapsed}
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<line x1="9" y1="3" x2="9" y2="21" />
		<polyline points="14 9 17 12 14 15" />
	</svg>
</button>

<style>
	.sidebar-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		padding: 0;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.sidebar-toggle:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
		border-color: var(--color-border-hover, var(--color-border));
	}

	.sidebar-toggle:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.sidebar-toggle svg {
		transition: transform var(--duration-normal) var(--ease-out);
	}

	.sidebar-toggle svg.rotated {
		transform: scaleX(-1);
	}

	@media (prefers-reduced-motion: reduce) {
		.sidebar-toggle,
		.sidebar-toggle svg {
			transition: none;
		}
	}

	@media (max-width: 900px) {
		.sidebar-toggle {
			display: none;
		}
	}
</style>

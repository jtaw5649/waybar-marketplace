<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { stars } from '$lib/stores/stars';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface StarredModule {
		uuid: string;
		name: string;
		icon_url?: string;
		author_username: string;
	}

	let isOpen = $state(false);
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let recentStars = $state<StarredModule[]>([]);
	let loading = $state(false);

	const starsState = fromStore(stars);

	const starCount = $derived(starsState.current.starred.size);

	async function loadRecentStars() {
		if (!starsState.current.isAuthenticated || recentStars.length > 0) return;

		loading = true;
		try {
			const res = await fetch('/api/stars');
			if (res.ok) {
				const data = await res.json();
				recentStars = (data.data?.modules || []).slice(0, 5);
			}
		} catch {
			recentStars = [];
		} finally {
			loading = false;
		}
	}

	function toggle() {
		isOpen = !isOpen;
		if (isOpen) {
			loadRecentStars();
		}
	}

	function close() {
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			dropdownRef &&
			triggerRef &&
			!dropdownRef.contains(event.target as Node) &&
			!triggerRef.contains(event.target as Node)
		) {
			close();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
			triggerRef?.focus();
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="stars-dropdown">
	<button
		bind:this={triggerRef}
		class="trigger"
		class:active={isOpen}
		onclick={toggle}
		aria-expanded={isOpen}
		aria-haspopup="true"
		aria-label="Your starred modules"
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path
				d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
			/>
		</svg>
		{#if starCount > 0}
			<span class="badge" in:fly={{ y: -5, duration: 150 }}
				>{starCount > 99 ? '99+' : starCount}</span
			>
		{/if}
	</button>

	{#if isOpen}
		<div
			bind:this={dropdownRef}
			class="dropdown"
			in:fly={{ y: -10, duration: 200 }}
			out:fade={{ duration: 100 }}
			role="menu"
		>
			<div class="dropdown-header">
				<span>Your Stars</span>
				<span class="count">{starCount}</span>
			</div>

			<div class="dropdown-body">
				{#if loading}
					<div class="loading">
						<div class="spinner"></div>
					</div>
				{:else if recentStars.length > 0}
					{#each recentStars as module (module.uuid)}
						<a href="/modules/{encodeURIComponent(module.uuid)}" class="star-item" onclick={close}>
							{#if module.icon_url}
								<img src={module.icon_url} alt="" class="item-icon" />
							{:else}
								<div class="item-icon placeholder">
									{module.name.charAt(0).toUpperCase()}
								</div>
							{/if}
							<div class="item-content">
								<span class="item-name">{module.name}</span>
								<span class="item-author">by {module.author_username}</span>
							</div>
						</a>
					{/each}
				{:else if starCount > 0}
					<div class="empty-local">
						<p>You have {starCount} starred module{starCount !== 1 ? 's' : ''}</p>
						<p class="hint">Sign in to see details</p>
					</div>
				{:else}
					<div class="empty">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
						<span>No starred modules</span>
					</div>
				{/if}
			</div>

			<div class="dropdown-footer">
				<a href="/stars" onclick={close}>View all stars</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.stars-dropdown {
		position: relative;
	}

	.trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 36px;
		height: 36px;
		padding: 0;
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-faint);
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.trigger svg {
		width: 18px;
		height: 18px;
	}

	.trigger:hover {
		color: var(--color-warning);
		border-color: var(--color-text-faint);
		background-color: var(--color-bg-surface);
	}

	.trigger.active {
		color: var(--color-warning);
		border-color: var(--color-warning);
		background-color: color-mix(in srgb, var(--color-warning) 10%, transparent);
	}

	.trigger:focus-visible {
		box-shadow: var(--focus-ring);
	}

	.badge {
		position: absolute;
		top: -6px;
		right: -6px;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		background: var(--color-warning);
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 280px;
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		z-index: 100;
		overflow: hidden;
	}

	.dropdown-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		font-weight: 600;
		font-size: 0.875rem;
	}

	.count {
		font-size: 0.75rem;
		color: var(--color-text-faint);
		background: var(--color-bg-surface);
		padding: 2px 8px;
		border-radius: 9999px;
	}

	.dropdown-body {
		max-height: 280px;
		overflow-y: auto;
	}

	.star-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		text-decoration: none;
		color: inherit;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.star-item:hover {
		background-color: var(--color-bg-surface);
	}

	.item-icon {
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
		object-fit: cover;
	}

	.item-icon.placeholder {
		background: linear-gradient(135deg, var(--color-primary), var(--color-info));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.item-content {
		flex: 1;
		min-width: 0;
	}

	.item-name {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-author {
		display: block;
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty,
	.empty-local {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
		text-align: center;
		color: var(--color-text-faint);
		font-size: 0.875rem;
	}

	.empty svg {
		width: 32px;
		height: 32px;
		margin-bottom: var(--space-sm);
	}

	.empty-local p {
		margin: 0;
	}

	.empty-local .hint {
		font-size: 0.75rem;
		margin-top: var(--space-xs);
	}

	.dropdown-footer {
		padding: var(--space-sm) var(--space-lg);
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-surface);
	}

	.dropdown-footer a {
		display: block;
		text-align: center;
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-primary);
		text-decoration: none;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.dropdown-footer a:hover {
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
	}
</style>

<script lang="ts">
	import Avatar from './Avatar.svelte';
	import { User, LayoutDashboard, Star, Upload, Settings, LogOut } from 'lucide-svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { signOutWithCleanup } from '$lib/utils/sessionCleanup';

	interface Props {
		user: { name?: string | null; email?: string | null; image?: string | null; login?: string };
	}

	let { user }: Props = $props();

	let isOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
			triggerRef?.focus();
		}
	}

	async function handleLogOut() {
		close();
		await signOutWithCleanup();
	}

	const username = $derived(user.login || user.name || 'User');
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="avatar-dropdown" use:clickOutside={{ handler: () => isOpen && close() }}>
	<button
		bind:this={triggerRef}
		class="avatar-trigger"
		onclick={toggle}
		aria-expanded={isOpen}
		aria-haspopup="true"
		aria-label="Open user menu"
	>
		<Avatar src={user.image ?? undefined} name={user.name ?? 'U'} size="md" />
	</button>

	{#if isOpen}
		<div class="dropdown-menu" role="menu">
			<div class="dropdown-header">
				<Avatar src={user.image ?? undefined} name={user.name ?? 'U'} size="lg" />
				<div class="dropdown-header-text">
					<span class="dropdown-name">{user.name ?? 'Account'}</span>
					<span class="dropdown-username">@{username}</span>
				</div>
			</div>

			<div class="dropdown-section">
				<a href="/users/{username}" role="menuitem" onclick={close}
					><User size={16} />Your profile</a
				>
				<a href="/dashboard" role="menuitem" onclick={close}
					><LayoutDashboard size={16} />Your modules</a
				>
				<a href="/stars" role="menuitem" onclick={close}><Star size={16} />Your stars</a>
			</div>

			<div class="dropdown-section">
				<a href="/upload" role="menuitem" onclick={close}><Upload size={16} />Upload module</a>
			</div>

			<div class="dropdown-section">
				<a href="/settings/profile" role="menuitem" onclick={close}
					><Settings size={16} />Settings</a
				>
			</div>

			<div class="dropdown-section dropdown-footer">
				<a href="#logout" role="menuitem" onclick={handleLogOut}><LogOut size={16} />Log out</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.avatar-dropdown {
		position: relative;
	}

	.avatar-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		transition:
			transform var(--duration-fast),
			background-color var(--duration-fast),
			border-color var(--duration-fast);
	}

	.avatar-trigger:hover {
		transform: scale(1.05);
		background-color: var(--color-bg-surface);
		border-color: var(--color-border);
	}

	.avatar-trigger:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.avatar-trigger :global(.avatar),
	.avatar-trigger :global(.avatar-placeholder) {
		width: 36px;
		height: 36px;
		border: none;
	}

	.dropdown-menu {
		position: absolute;
		right: 0;
		margin-top: var(--space-sm);
		min-width: 200px;
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		z-index: 30;
		overflow: hidden;
	}

	.dropdown-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.dropdown-header-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.dropdown-name {
		font-weight: 600;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dropdown-username {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dropdown-section {
		padding: var(--space-xs) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.dropdown-section:last-child {
		border-bottom: none;
	}

	.dropdown-section a {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-md);
		text-decoration: none;
		color: inherit;
		font-size: 0.875rem;
	}

	.dropdown-section a:hover {
		background: var(--color-bg-elevated);
	}

	.dropdown-footer a {
		color: var(--color-text-muted);
	}
</style>

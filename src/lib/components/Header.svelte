<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import type { Session } from '@auth/sveltekit';
	import { open } from '$lib/stores/commandPalette';

	interface Props {
		session: Session | null;
	}

	let { session }: Props = $props();

	let mobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleSignOut() {
		closeMobileMenu();
		signOut();
	}

	const loginUrl = $derived(`/login?redirectTo=${encodeURIComponent($page.url.pathname + $page.url.search)}`);
</script>

<header>
	<div class="header-content">
		<a href="/" class="logo" onclick={closeMobileMenu}>
			<svg
				width="28"
				height="28"
				viewBox="8 8 112 112"
				fill="none"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stop-color="#617DFA" />
						<stop offset="100%" stop-color="#8B5CF6" />
					</linearGradient>
				</defs>
				<rect x="10" y="44" width="108" height="40" rx="12" fill="var(--color-bg-elevated)" stroke="url(#logoGrad)" stroke-width="4" />
				<rect x="18" y="52" width="24" height="24" rx="6" fill="url(#logoGrad)" />
				<rect x="48" y="52" width="36" height="24" rx="6" fill="var(--color-border)" />
				<rect x="90" y="52" width="20" height="24" rx="6" fill="var(--color-border)" fill-opacity="0.5" />
			</svg>
			<span>Waybar Marketplace</span>
		</a>

		<nav class="desktop-nav" aria-label="Main navigation">
			<a href="/browse" class:active={$page.url.pathname.startsWith('/browse')}>Browse</a>
			{#if session?.user}
				<a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a>
			{/if}
		</nav>

		<div class="header-actions desktop-actions">
			<button class="search-trigger" onclick={open} aria-label="Search">
				<kbd>⌘</kbd><kbd>⇧</kbd><kbd>K</kbd>
			</button>
			{#if session?.user}
				<a href="/upload" class="btn btn-small">Upload</a>
				<a href="/dashboard" class="user-link">
					{#if session.user.image}
						<img src={session.user.image} alt="" class="avatar" />
					{:else}
						<div class="avatar-placeholder">
							{session.user.name?.charAt(0).toUpperCase() || 'U'}
						</div>
					{/if}
					<span class="user-name">{session.user.name}</span>
				</a>
				<button class="btn btn-small btn-ghost" onclick={() => signOut()}>Sign Out</button>
			{:else}
				<a href={loginUrl} class="btn btn-small btn-primary">Sign In</a>
			{/if}
		</div>

		<button
			class="mobile-menu-toggle"
			onclick={toggleMobileMenu}
			aria-expanded={mobileMenuOpen}
			aria-controls="mobile-menu"
			aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
		>
			{#if mobileMenuOpen}
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			{:else}
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			{/if}
		</button>
	</div>

	{#if mobileMenuOpen}
		<div class="mobile-menu-backdrop" onclick={closeMobileMenu} aria-hidden="true"></div>
		<nav id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation">
			<a href="/browse" class="mobile-link" onclick={closeMobileMenu}>Browse</a>
			{#if session?.user}
				<a href="/dashboard" class="mobile-link" onclick={closeMobileMenu}>Dashboard</a>
				<a href="/upload" class="mobile-link" onclick={closeMobileMenu}>Upload Module</a>
				<div class="mobile-divider"></div>
				<div class="mobile-user">
					{#if session.user.image}
						<img src={session.user.image} alt="" class="avatar" />
					{:else}
						<div class="avatar-placeholder">
							{session.user.name?.charAt(0).toUpperCase() || 'U'}
						</div>
					{/if}
					<span>{session.user.name}</span>
				</div>
				<button class="mobile-link mobile-button" onclick={handleSignOut}>Sign Out</button>
			{:else}
				<div class="mobile-divider"></div>
				<a href={loginUrl} class="btn btn-primary mobile-cta" onclick={closeMobileMenu}>Sign In</a>
			{/if}
		</nav>
	{/if}
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 100;
		background-color: var(--color-bg-base);
		border-bottom: 1px solid var(--color-border);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-2xl);
		max-width: 1400px;
		margin: 0 auto;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-normal);
		text-decoration: none;
	}

	.logo:hover {
		color: var(--color-primary);
	}

	.logo svg {
		color: var(--color-primary);
	}

	.desktop-nav {
		display: flex;
		gap: var(--space-xl);
	}

	.desktop-nav a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 500;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.desktop-nav a:hover {
		color: var(--color-text-normal);
		background-color: var(--color-bg-surface);
	}

	.desktop-nav a.active {
		color: var(--color-text-normal);
		background-color: var(--color-bg-surface);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.user-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		text-decoration: none;
		color: inherit;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.user-link:hover {
		background-color: var(--color-bg-surface);
	}

	.avatar {
		width: 28px;
		height: 28px;
		border-radius: 50%;
	}

	.avatar-placeholder {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.user-name {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: var(--radius-md);
		text-decoration: none;
		border: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.btn:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-primary);
		color: var(--color-text-normal);
	}

	.btn-small {
		padding: var(--space-xs) var(--space-md);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.btn-primary:hover {
		background-color: #5068d9;
		border-color: #5068d9;
	}

	.btn-ghost {
		background-color: transparent;
		color: var(--color-text-muted);
		border-color: transparent;
	}

	.btn-ghost:hover {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border-color: transparent;
	}

	.search-trigger {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: var(--space-xs) var(--space-sm);
		background: none;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.search-trigger:hover {
		background-color: var(--color-bg-surface);
	}

	.search-trigger:hover kbd {
		border-color: var(--color-text-faint);
		color: var(--color-text-muted);
	}

	.search-trigger:focus-visible {
		box-shadow: var(--focus-ring);
	}

	.search-trigger kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 4px;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: 0.7rem;
		font-family: inherit;
		color: var(--color-text-faint);
		transition: border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.mobile-menu-toggle {
		display: none;
		padding: var(--space-sm);
		background: none;
		border: none;
		color: var(--color-text-normal);
		cursor: pointer;
		border-radius: var(--radius-sm);
	}

	.mobile-menu-toggle:hover {
		background-color: var(--color-bg-surface);
	}

	.mobile-menu-backdrop {
		display: none;
	}

	.mobile-menu {
		display: none;
	}

	@media (max-width: 768px) {
		.header-content {
			padding: var(--space-md) var(--space-lg);
		}

		.desktop-nav,
		.desktop-actions {
			display: none;
		}

		.mobile-menu-toggle {
			display: block;
		}

		.mobile-menu-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			top: 57px;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 99;
		}

		.mobile-menu {
			display: flex;
			flex-direction: column;
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background-color: var(--color-bg-base);
			border-bottom: 1px solid var(--color-border);
			padding: var(--space-md);
			z-index: 100;
			animation: slideDown 0.2s ease-out;
		}

		@keyframes slideDown {
			from {
				opacity: 0;
				transform: translateY(-8px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.mobile-link {
			display: block;
			padding: var(--space-md) var(--space-lg);
			color: var(--color-text-normal);
			text-decoration: none;
			font-size: 1rem;
			border-radius: var(--radius-md);
		}

		.mobile-link:hover {
			background-color: var(--color-bg-surface);
		}

		.mobile-button {
			background: none;
			border: none;
			cursor: pointer;
			text-align: left;
			width: 100%;
			font: inherit;
		}

		.mobile-divider {
			height: 1px;
			background-color: var(--color-border);
			margin: var(--space-md) 0;
		}

		.mobile-user {
			display: flex;
			align-items: center;
			gap: var(--space-md);
			padding: var(--space-md) var(--space-lg);
			color: var(--color-text-muted);
			font-size: 0.9rem;
		}

		.mobile-cta {
			margin: var(--space-sm) var(--space-md);
			padding: var(--space-md);
			text-align: center;
		}
	}
</style>

<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/state';
	import type { Session } from '@auth/sveltekit';
	import { Sun, Moon, Monitor, Search, Menu, X } from 'lucide-svelte';
	import { open } from '$lib/stores/commandPalette';
	import { fromStore } from 'svelte/store';
	import { theme } from '$lib/stores/theme';
	import Button from './Button.svelte';
	import Avatar from './Avatar.svelte';
	import SearchInput from './SearchInput.svelte';
	import AvatarDropdown from './AvatarDropdown.svelte';

	interface Props {
		session: Session | null;
	}

	let { session }: Props = $props();

	let mobileMenuOpen = $state(false);
	const themeState = fromStore(theme);

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

	const loginUrl = $derived(
		`/login?redirectTo=${encodeURIComponent(page.url.pathname + page.url.search)}`
	);
</script>

<header class="site-header">
	<div class="header-container">
		<a href="/" class="logo" onclick={closeMobileMenu}>
			<svg
				class="logo-mark"
				width="32"
				height="32"
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
				<rect
					x="10"
					y="44"
					width="108"
					height="40"
					rx="12"
					fill="var(--color-bg-elevated)"
					stroke="url(#logoGrad)"
					stroke-width="4"
				/>
				<rect x="18" y="52" width="24" height="24" rx="6" fill="url(#logoGrad)" />
				<rect x="48" y="52" width="36" height="24" rx="6" fill="var(--color-border)" />
				<rect
					x="90"
					y="52"
					width="20"
					height="24"
					rx="6"
					fill="var(--color-border)"
					fill-opacity="0.5"
				/>
			</svg>
			<span class="logo-text">
				<span class="logo-title">Barforge</span>
				<span class="logo-subtitle">MODULE REGISTRY</span>
			</span>
		</a>

		<nav class="nav-links" aria-label="Main navigation">
			<a href="/modules" class:active={page.url.pathname.startsWith('/modules')}>Modules</a>
			{#if session?.user}
				<a href="/dashboard" class:active={page.url.pathname === '/dashboard'}>Dashboard</a>
			{/if}
		</nav>

		<div class="header-actions">
			<div class="header-search">
				<SearchInput size="sm" />
			</div>
			<button
				class="theme-toggle"
				onclick={theme.cycle}
				aria-label="Toggle theme (currently {themeState.current})"
				title="Theme: {themeState.current}"
			>
				{#key themeState.current}
					<div class="icon-wrapper">
						{#if themeState.current === 'light'}
							<Sun size={18} />
						{:else if themeState.current === 'dark'}
							<Moon size={18} />
						{:else}
							<Monitor size={18} />
						{/if}
					</div>
				{/key}
			</button>
			{#if session?.user}
				<AvatarDropdown user={session.user} />
			{:else}
				<a href={loginUrl} class="header-btn header-btn-primary">Log In</a>
			{/if}
		</div>

		<div class="mobile-controls">
			<button class="mobile-search" onclick={open} aria-label="Open command palette">
				<Search size={20} />
			</button>
			<button
				class="mobile-menu-toggle"
				onclick={toggleMobileMenu}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-menu"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
			>
				{#if mobileMenuOpen}
					<X size={24} />
				{:else}
					<Menu size={24} />
				{/if}
			</button>
		</div>
	</div>

	{#if mobileMenuOpen}
		<div class="mobile-menu-backdrop" onclick={closeMobileMenu} aria-hidden="true"></div>
		<nav id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation">
			<a href="/modules" class="mobile-link" onclick={closeMobileMenu}>Modules</a>
			{#if session?.user}
				<a href="/dashboard" class="mobile-link" onclick={closeMobileMenu}>Dashboard</a>
				<div class="mobile-divider"></div>
				<div class="mobile-user">
					<Avatar src={session.user.image} name={session.user.name || 'U'} size="sm" />
					<span>{session.user.name}</span>
				</div>
				<button class="mobile-link mobile-button" onclick={handleSignOut}>Log Out</button>
			{:else}
				<div class="mobile-divider"></div>
				<Button href={loginUrl} variant="primary" onclick={closeMobileMenu}>Log In</Button>
			{/if}
		</nav>
	{/if}
</header>

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
	}

	.header-container {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-md) var(--space-xl);
		background: var(--color-bg-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		text-decoration: none;
		color: var(--color-text-normal);
		flex-shrink: 0;
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.logo:hover {
		transform: scale(1.02);
	}

	.logo-mark {
		color: var(--color-primary);
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		line-height: 1;
	}

	.logo-title {
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.logo-subtitle {
		margin-top: 4px;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-text-faint);
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.nav-links a {
		position: relative;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
		padding: var(--space-sm) var(--space-md);
		border-radius: 9999px;
		border: 1px solid transparent;
		transition:
			color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.nav-links a:hover {
		color: var(--color-text-normal);
		background-color: var(--color-bg-elevated);
		border-color: color-mix(in srgb, var(--color-border) 50%, transparent);
		transform: translateY(-1px);
	}

	.nav-links a.active {
		color: var(--color-primary);
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-left: auto;
		flex-shrink: 0;
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		background: var(--color-bg-elevated);
		border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		border-radius: 9999px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			transform var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
		overflow: hidden;
	}

	.theme-toggle:hover {
		transform: scale(1.05);
		background-color: var(--color-bg-surface);
		border-color: var(--color-border);
		color: var(--color-text-normal);
	}

	.theme-toggle:active {
		transform: scale(0.95);
	}

	.theme-toggle:focus-visible {
		box-shadow: var(--focus-ring);
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		animation: rotateIn 0.2s var(--ease-out);
	}

	@keyframes rotateIn {
		from {
			transform: rotate(-90deg);
			opacity: 0;
		}
		to {
			transform: rotate(0deg);
			opacity: 1;
		}
	}

	.header-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm) var(--space-md);
		border-radius: 9999px;
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: 1px solid transparent;
		transition:
			transform var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	.header-btn:hover {
		transform: translateY(-1px);
	}

	.header-btn:active {
		transform: scale(0.98);
	}

	.header-btn:focus-visible {
		box-shadow: var(--focus-ring);
	}

	.header-btn-primary {
		background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
		color: white;
		border-color: transparent;
		box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent);
	}

	.header-btn-primary:hover {
		box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent);
	}

	.mobile-controls {
		display: none;
		align-items: center;
		gap: var(--space-sm);
	}

	.mobile-search,
	.mobile-menu-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		background: var(--color-bg-elevated);
		border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
		border-radius: 999px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.mobile-search:hover,
	.mobile-menu-toggle:hover {
		border-color: var(--color-primary);
		color: var(--color-text-normal);
		transform: scale(1.05);
	}

	.mobile-menu-backdrop {
		display: none;
	}

	.mobile-menu {
		display: none;
	}

	@media (max-width: 1024px) {
		.header-container {
			padding: var(--space-md) var(--space-lg);
		}

		.logo-subtitle {
			display: none;
		}
	}

	@media (max-width: 768px) {
		header {
			top: 0;
			left: 0;
			right: 0;
		}

		.header-container {
			padding: var(--space-sm) var(--space-md);
		}

		.nav-links,
		.header-actions {
			display: none;
		}

		.mobile-controls {
			display: flex;
			margin-left: auto;
		}

		.mobile-menu-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.6);
			backdrop-filter: blur(4px);
			z-index: 90;
		}

		.mobile-menu {
			display: flex;
			flex-direction: column;
			position: absolute;
			top: calc(100% + 0.5rem);
			left: 0;
			right: 0;
			background: var(--color-bg-surface);
			border: 1px solid var(--color-border);
			border-radius: 0.75rem;
			padding: var(--space-md);
			z-index: 101;
			box-shadow: var(--shadow-lg);
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
			background: var(--color-bg-elevated);
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
			background: var(--color-border);
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
	}

	@media (prefers-reduced-motion: reduce) {
		.icon-wrapper {
			animation: none;
		}

		.theme-toggle:hover,
		.theme-toggle:active {
			transform: none;
		}

		.logo:hover,
		.nav-links a:hover,
		.header-btn:hover,
		.header-btn:active,
		.mobile-search:hover,
		.mobile-menu-toggle:hover {
			transform: none;
		}
	}
</style>

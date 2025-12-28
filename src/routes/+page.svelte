<script lang="ts">
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import InstallSnippet from '$lib/components/InstallSnippet.svelte';
	import {
		Package,
		Download,
		Zap,
		Settings,
		ChevronRight,
		MousePointer,
		RefreshCw,
		Users,
		ArrowRight
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const stats = $derived(
		data.landing?.stats ?? { total_modules: 0, total_downloads: 0, total_authors: 0 }
	);

	function formatNumber(num: number): string {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	}
</script>

<Header session={data.session} />

<main id="main-content">
	<!-- Hero Panel -->
	<section class="tui-panel hero-panel">
		<div class="tui-panel-header">
			<span class="tui-panel-title">[ BARFORGE ]</span>
			<span class="tui-panel-status">v1.0</span>
		</div>
		<div class="tui-panel-body hero-body">
			<p class="hero-tagline">Desktop manager for Waybar modules</p>
			<p class="hero-desc">
				Browse, install, and manage community modules for your Waybar status bar.<br />
				Native desktop app with one-click installs.
			</p>

			<!-- Stats Grid -->
			<div class="stats-grid">
				<div class="stat-box">
					<div class="stat-icon"><Package size={16} /></div>
					<div class="stat-info">
						<span class="stat-value">{stats.total_modules}</span>
						<span class="stat-label">modules</span>
					</div>
				</div>
				<div class="stat-box">
					<div class="stat-icon"><Users size={16} /></div>
					<div class="stat-info">
						<span class="stat-value">{stats.total_authors}</span>
						<span class="stat-label">authors</span>
					</div>
				</div>
				<div class="stat-box">
					<div class="stat-icon"><Download size={16} /></div>
					<div class="stat-info">
						<span class="stat-value">{formatNumber(stats.total_downloads)}</span>
						<span class="stat-label">downloads</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Install Panel -->
	<InstallSnippet />

	<!-- Features Panel -->
	<section class="tui-panel">
		<div class="tui-panel-header">
			<span class="tui-panel-title">[ FEATURES ]</span>
		</div>
		<div class="tui-panel-body">
			<div class="features-grid">
				<div class="feature-box">
					<div class="feature-header">
						<MousePointer size={14} />
						<span>One-Click Install</span>
					</div>
					<div class="feature-body">No config editing required</div>
				</div>
				<div class="feature-box">
					<div class="feature-header">
						<Package size={14} />
						<span>Module Registry</span>
					</div>
					<div class="feature-body">Community-driven collection</div>
				</div>
				<div class="feature-box">
					<div class="feature-header">
						<Settings size={14} />
						<span>Auto Configuration</span>
					</div>
					<div class="feature-body">Generated preferences UI</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Desktop App Panel -->
	<section class="tui-panel">
		<div class="tui-panel-header">
			<span class="tui-panel-title">[ DESKTOP APP ]</span>
			<a
				href="https://github.com/jtaw5649/barforge-app"
				class="tui-panel-link"
				target="_blank"
				rel="noopener"
			>
				GitHub <ArrowRight size={12} />
			</a>
		</div>
		<div class="tui-panel-body">
			<div class="app-features">
				<div class="app-feature">
					<Download size={14} class="app-feature-icon" />
					<div class="app-feature-text">
						<span class="app-feature-title">Browse & Install</span>
						<span class="app-feature-desc">Discover and install modules from the registry</span>
					</div>
				</div>
				<div class="app-feature">
					<RefreshCw size={14} class="app-feature-icon" />
					<div class="app-feature-text">
						<span class="app-feature-title">Update Manager</span>
						<span class="app-feature-desc">Keep your modules up to date</span>
					</div>
				</div>
				<div class="app-feature">
					<Settings size={14} class="app-feature-icon" />
					<div class="app-feature-text">
						<span class="app-feature-title">Module Preferences</span>
						<span class="app-feature-desc">Auto-generated settings for each module</span>
					</div>
				</div>
				<div class="app-feature">
					<Zap size={14} class="app-feature-icon" />
					<div class="app-feature-text">
						<span class="app-feature-title">Enable / Disable</span>
						<span class="app-feature-desc">Toggle modules without uninstalling</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Navigation Panel -->
	<section class="tui-panel">
		<div class="tui-panel-header">
			<span class="tui-panel-title">[ NAVIGATION ]</span>
		</div>
		<div class="tui-panel-body nav-body">
			<a href="/modules" class="nav-card" data-sveltekit-preload-data="hover">
				<div class="nav-card-icon"><Package size={20} /></div>
				<div class="nav-card-content">
					<span class="nav-card-title">Browse Modules</span>
					<span class="nav-card-desc"
						>{stats.total_modules} community modules across all categories</span
					>
				</div>
				<div class="nav-card-arrow">
					<ChevronRight size={20} />
				</div>
			</a>
			<a href="/upload" class="nav-card" data-sveltekit-preload-data="hover">
				<div class="nav-card-icon"><Icon name="simple-icons:github" size={20} /></div>
				<div class="nav-card-content">
					<span class="nav-card-title">Publish a Module</span>
					<span class="nav-card-desc">Share your work with the community</span>
				</div>
				<div class="nav-card-arrow">
					<ChevronRight size={20} />
				</div>
			</a>
		</div>
	</section>
</main>

<Footer />

<style>
	main {
		display: flex;
		flex-direction: column;
		padding: 5rem var(--space-lg) var(--space-lg);
		gap: var(--space-lg);
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	@media (max-width: 768px) {
		main {
			padding: 4rem var(--space-md) var(--space-md);
		}
	}

	@media (max-width: 480px) {
		main {
			padding: 4rem var(--space-sm) var(--space-sm);
		}
	}

	/* Hero Panel */
	.hero-panel {
		border-color: var(--color-primary);
		border-width: 2px;
	}

	.hero-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.hero-tagline {
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-normal);
		margin-bottom: var(--space-sm);
	}

	.hero-desc {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		max-width: 500px;
		margin-bottom: var(--space-xl);
		line-height: 1.6;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
		width: 100%;
		max-width: 500px;
	}

	@media (max-width: 500px) {
		.stats-grid {
			grid-template-columns: 1fr;
			max-width: 280px;
			margin: 0 auto;
		}
	}

	.stat-box {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-base);
		border: 1px solid var(--color-border);
		transition: border-color var(--duration-fast);
	}

	.stat-box:hover {
		border-color: var(--color-primary);
	}

	.stat-icon {
		color: var(--color-text-faint);
	}

	.stat-info {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-primary);
		line-height: 1;
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--color-text-faint);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Features Grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
	}

	@media (max-width: 640px) {
		.features-grid {
			grid-template-columns: 1fr;
		}
	}

	.feature-box {
		background: var(--color-bg-base);
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		transition: border-color var(--duration-fast);
	}

	.feature-box:hover {
		border-color: var(--color-primary);
	}

	.feature-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-normal);
		margin-bottom: var(--space-sm);
		padding-bottom: var(--space-sm);
		border-bottom: 1px solid var(--color-border);
	}

	.feature-header :global(svg) {
		color: var(--color-text-muted);
	}

	.feature-body {
		font-size: 0.8125rem;
		color: var(--color-text-faint);
	}

	/* App Features */
	.app-features {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
	}

	@media (max-width: 640px) {
		.app-features {
			grid-template-columns: 1fr;
		}
	}

	.app-feature {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg-base);
	}

	.app-feature:hover {
		border-color: var(--color-primary);
	}

	:global(.app-feature-icon) {
		color: var(--color-text-muted);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.app-feature-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.app-feature-title {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-normal);
	}

	.app-feature-desc {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	/* Navigation Cards */
	.nav-body {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-md);
		padding: var(--space-md);
	}

	@media (max-width: 768px) {
		.nav-body {
			grid-template-columns: 1fr;
		}
	}

	.nav-card {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg-base);
		text-decoration: none;
	}

	.nav-card:hover {
		border-color: var(--color-primary);
		background: var(--color-bg-elevated);
		text-decoration: none;
	}

	.nav-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-surface);
		color: var(--color-text-faint);
		flex-shrink: 0;
	}

	.nav-card:hover .nav-card-icon {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.nav-card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.nav-card-title {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-normal);
	}

	.nav-card-desc {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.nav-card-arrow {
		color: var(--color-text-faint);
	}

	.nav-card:hover .nav-card-arrow {
		color: var(--color-primary);
	}
</style>

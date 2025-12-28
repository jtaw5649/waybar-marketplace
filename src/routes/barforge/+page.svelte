<script lang="ts">
	import { Github, ExternalLink, ArrowLeft, Star, GitFork, Users } from 'lucide-svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Footer from '$lib/components/Footer.svelte';

	interface Props {
		data: {
			stats: {
				stars: number;
				forks: number;
				contributors: number;
			};
		};
	}

	let { data }: Props = $props();

	const repos = [
		{
			name: 'barforge-web',
			desc: 'Barforge Hub — browse and discover modules',
			url: 'https://github.com/jtaw5649/barforge-web',
			tech: [
				{ icon: 'simple-icons:svelte', color: '#ff3e00' },
				{ icon: 'simple-icons:typescript', color: '#3178c6' },
				{ icon: 'simple-icons:cloudflare', color: '#f6821f' }
			]
		},
		{
			name: 'barforge-app',
			desc: 'Barforge App — install and configure modules',
			url: 'https://github.com/jtaw5649/barforge-app',
			tech: [{ icon: 'simple-icons:rust', color: '#dea584' }, { localIcon: '/iced-logo.svg' }]
		}
	];

	const techStack = [
		{ name: 'Svelte', icon: 'simple-icons:svelte', color: '#ff3e00' },
		{ name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178c6' },
		{ name: 'Cloudflare', icon: 'simple-icons:cloudflare', color: '#f6821f' },
		{ name: 'Rust', icon: 'simple-icons:rust', color: '#dea584' },
		{ name: 'Iced', localIcon: '/iced-logo.svg' }
	];

	const stats = $derived([
		{ label: 'Stars', value: data.stats.stars, icon: Star },
		{ label: 'Forks', value: data.stats.forks, icon: GitFork },
		{ label: 'Contributors', value: data.stats.contributors, icon: Users }
	]);
</script>

<svelte:head>
	<title>Source Code | Barforge</title>
	<meta name="description" content="Barforge open source repositories and tech stack" />
</svelte:head>

<main class="barforge-page">
	<a href="/" class="back-link" aria-label="Back to homepage">
		<ArrowLeft size={16} />
		<span>Back</span>
	</a>

	<!-- Intro Section -->
	<section class="intro-section">
		<div class="intro-logo">
			<svg
				class="logo-mark"
				width="64"
				height="64"
				viewBox="0 0 100 100"
				fill="none"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="ecosystemLogoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#cba6f7" />
						<stop offset="100%" stop-color="#89b4fa" />
					</linearGradient>
				</defs>
				<path d="M10 20 L90 20 L78 38 L22 38 Z" fill="url(#ecosystemLogoGrad)" />
				<path d="M30 43 L70 43 L70 60 L30 60 Z" fill="url(#ecosystemLogoGrad)" fill-opacity="0.9" />
				<path d="M22 65 L78 65 L90 85 L10 85 Z" fill="url(#ecosystemLogoGrad)" fill-opacity="0.8" />
			</svg>
		</div>
		<h1>Barforge Ecosystem</h1>
		<p>
			A complete toolkit for discovering, installing, and managing Waybar modules. Browse Barforge
			Hub to find community modules, then use Barforge App for seamless installation and
			configuration.
		</p>
	</section>

	<!-- Stats Grid -->
	<section class="stats-section">
		{#each stats as stat (stat.label)}
			<div class="stat-box">
				<div class="stat-icon">
					<stat.icon size={20} />
				</div>
				<div class="stat-content">
					<span class="stat-value">{stat.value}</span>
					<span class="stat-label">{stat.label}</span>
				</div>
			</div>
		{/each}
	</section>

	<!-- Repository Cards -->
	<section class="tui-panel">
		<div class="tui-panel-header">
			<span class="tui-panel-title">[ REPOSITORIES ]</span>
		</div>
		<div class="tui-panel-body repo-grid">
			{#each repos as repo (repo.name)}
				<a
					href={repo.url}
					target="_blank"
					rel="noopener"
					class="repo-card"
					aria-label="{repo.name} - {repo.desc}"
				>
					<div class="repo-icon"><Github size={24} /></div>
					<div class="repo-content">
						<span class="repo-name">{repo.name}</span>
						<span class="repo-desc">{repo.desc}</span>
						<div class="repo-tech-icons">
							{#each repo.tech as tech, i (i)}
								{#if tech.icon}
									<span class="repo-tech-icon" style="color: {tech.color}">
										<Icon name={tech.icon} size={14} />
									</span>
								{:else if tech.localIcon}
									<img
										src={tech.localIcon}
										alt=""
										class="repo-tech-local-icon"
										width="14"
										height="14"
										loading="lazy"
										decoding="async"
									/>
								{/if}
							{/each}
						</div>
					</div>
					<ExternalLink size={16} class="repo-arrow" />
				</a>
			{/each}
		</div>
	</section>

	<!-- Tech Stack Section -->
	<section class="tui-panel">
		<div class="tui-panel-header">
			<span class="tui-panel-title">[ TECH STACK ]</span>
		</div>
		<div class="tui-panel-body tech-grid">
			{#each techStack as tech (tech.name)}
				<div class="tech-item">
					{#if tech.icon}
						<span class="tech-icon" style="color: {tech.color}">
							<Icon name={tech.icon} size={16} />
						</span>
					{:else if tech.localIcon}
						<img
							src={tech.localIcon}
							alt=""
							class="tech-local-icon"
							width="16"
							height="16"
							loading="lazy"
							decoding="async"
						/>
					{/if}
					<span class="tech-name">{tech.name}</span>
				</div>
			{/each}
		</div>
	</section>
</main>

<Footer />

<style>
	.barforge-page {
		padding: var(--space-3xl) var(--space-xl);
		padding-top: var(--space-3xl);
		max-width: 700px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-text-faint);
		font-family: var(--font-mono);
		font-size: 0.875rem;
		text-decoration: none;
		margin-bottom: var(--space-xl);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.back-link:hover {
		color: var(--color-primary);
		text-decoration: none;
	}

	/* Intro Section */
	.intro-section {
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.intro-logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-lg);
	}

	.logo-mark {
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
	}

	.intro-section h1 {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-normal);
		margin-bottom: var(--space-sm);
	}

	.intro-section p {
		color: var(--color-text-muted);
		font-size: 0.9375rem;
		line-height: 1.6;
		max-width: 500px;
		margin: 0 auto;
	}

	/* Stats Section */
	.stats-section {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
	}

	.stat-box {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.stat-box:hover {
		border-color: var(--color-primary);
	}

	.stat-icon {
		color: var(--color-primary);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-normal);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	/* Repository Cards */
	.repo-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.repo-card {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		padding: var(--space-lg);
		border: 1px solid var(--color-border);
		background: var(--color-bg-surface);
		color: var(--color-text-normal);
		text-decoration: none;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.repo-card:hover {
		border-color: var(--color-primary);
		text-decoration: none;
	}

	.repo-card:hover .repo-icon {
		color: var(--color-primary);
	}

	.repo-icon {
		color: var(--color-text-faint);
		transition: color var(--duration-fast) var(--ease-out);
		flex-shrink: 0;
		margin-top: 2px;
	}

	.repo-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.repo-name {
		font-family: var(--font-mono);
		font-weight: 600;
	}

	.repo-desc {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.repo-tech-icons {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-xs);
	}

	.repo-tech-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.repo-card :global(.repo-arrow) {
		color: var(--color-text-faint);
		flex-shrink: 0;
		margin-top: 2px;
	}

	/* Tech Stack Grid */
	.tech-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-sm);
	}

	.tech-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.tech-item:hover {
		border-color: var(--color-text-faint);
	}

	.tech-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.tech-local-icon {
		flex-shrink: 0;
	}

	.tech-name {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-text-normal);
	}

	/* TUI Panel spacing */
	.tui-panel {
		margin-bottom: var(--space-lg);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.barforge-page {
			padding: var(--space-xl) var(--space-md);
			padding-top: var(--space-xl);
		}

		.stats-section {
			grid-template-columns: 1fr;
		}

		.tech-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';

	const installCommand = 'barforge apply starter-layout';
	const heroTags = ['File-first', 'Open source', 'Wayland-ready'];
	const heroStats = [
		{ value: '3', label: 'steps' },
		{ value: 'Files', label: 'your config' },
		{ value: 'OSS', label: 'public' }
	];
</script>

<section class="hero">
	<div class="hero-grid" aria-hidden="true"></div>
	<div class="hero-glow" aria-hidden="true"></div>
	<div class="hero-shell">
		<div class="hero-copy">
			<p class="hero-eyebrow">Barforge</p>
			<h1 class="hero-title">Start with a working bar.</h1>
			<p class="hero-lead">Install Barforge, apply a layout, and tune your files.</p>
			<div class="hero-actions">
				<Button href="#install" variant="primary" size="lg">Install Barforge</Button>
				<Button href="#workflow" variant="secondary" size="lg">See it in action</Button>
			</div>
			<div class="hero-tags">
				{#each heroTags as tag (tag)}
					<span class="hero-tag">{tag}</span>
				{/each}
			</div>
		</div>
		<div class="hero-panel">
			<div class="terminal">
				<div class="terminal-top">
					<span class="terminal-dot terminal-dot-red"></span>
					<span class="terminal-dot terminal-dot-amber"></span>
					<span class="terminal-dot terminal-dot-green"></span>
					<span class="terminal-title">Apply a layout</span>
				</div>
				<div class="terminal-body">
					<code>$ {installCommand}</code>
					<CopyButton text={installCommand} />
				</div>
			</div>
			<div class="hero-stats">
				{#each heroStats as stat (stat.label)}
					<div class="hero-stat">
						<span class="hero-stat-value">{stat.value}</span>
						<span class="hero-stat-label">{stat.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		padding: var(--space-3xl) var(--space-xl) var(--space-2xl);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 40%, transparent);
		background:
			radial-gradient(ellipse 90% 60% at 50% -15%, rgba(111, 125, 255, 0.22), transparent 60%),
			linear-gradient(180deg, rgba(13, 15, 28, 0.98), rgba(13, 15, 28, 0.6) 65%, transparent);
		overflow: hidden;
	}

	.hero-grid,
	.hero-glow {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.hero-grid {
		background:
			linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
		background-size: 48px 48px;
		opacity: 0.3;
		mask-image: radial-gradient(circle at 50% 0%, #000 0%, transparent 70%);
	}

	.hero-glow {
		width: min(960px, 140vw);
		height: min(520px, 70vh);
		left: 50%;
		top: -40%;
		transform: translateX(-50%);
		background: radial-gradient(
			circle at 50% 50%,
			rgba(138, 123, 255, 0.45),
			rgba(111, 125, 255, 0.12) 55%,
			transparent 75%
		);
		filter: blur(60px);
		opacity: 0.5;
	}

	.hero-shell {
		position: relative;
		z-index: 1;
		max-width: min(1100px, 92vw);
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-2xl);
		align-items: center;
	}

	.hero-copy {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.hero-eyebrow {
		font-size: 0.75rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-text-faint);
		margin: 0;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 5vw, 3.8rem);
		font-weight: 700;
		line-height: 1.1;
		margin: 0;
		letter-spacing: -0.025em;
		color: var(--color-text-normal);
	}

	.hero-lead {
		font-size: 1.25rem;
		color: var(--color-text-muted);
		margin: 0;
		max-width: 28rem;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.hero-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.hero-tag {
		padding: 6px 12px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-primary) 15%, var(--color-bg-surface));
		border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.hero-panel {
		background: var(--color-bg-surface);
		border-radius: 1rem;
		border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
		padding: var(--space-lg);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.terminal {
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
		background: color-mix(in srgb, var(--color-bg-surface) 70%, transparent);
		overflow: hidden;
	}

	.terminal-top {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
	}

	.terminal-title {
		margin-left: auto;
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.terminal-dot {
		width: 10px;
		height: 10px;
		border-radius: 999px;
	}

	.terminal-dot-red {
		background: #ef4444;
	}

	.terminal-dot-amber {
		background: #f59e0b;
	}

	.terminal-dot-green {
		background: #22c55e;
	}

	.terminal-body {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-md);
		font-family: var(--font-mono);
		font-size: 0.85rem;
		background: color-mix(in srgb, var(--color-bg-base) 80%, transparent);
	}

	.terminal-body code {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.hero-stats {
		display: flex;
		gap: var(--space-xl);
	}

	.hero-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.hero-stat-value {
		font-size: 2.5rem;
		font-weight: 300;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.hero-stat-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-faint);
	}

	@media (max-width: 640px) {
		.hero {
			padding: var(--space-2xl) var(--space-md);
		}

		.hero-title {
			font-size: 2.2rem;
		}

		.hero-lead {
			font-size: 1.1rem;
		}

		.terminal-body {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>

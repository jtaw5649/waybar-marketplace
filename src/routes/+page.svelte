<script lang="ts">
	import { page } from '$app/state';
</script>

<main>
	<header>
		<h1>Waybar Modules</h1>
		<p>Browse, install, and share Waybar modules</p>
	</header>

	<section class="hero">
		<div class="hero-content">
			<h2>Discover modules for your Waybar</h2>
			<p>
				Find community-created modules to enhance your Waybar experience.
				Install with a single click using Waybar Manager.
			</p>
			<div class="hero-actions">
				<a href="/browse" class="btn btn-primary">Browse Modules</a>
				<a href="/login" class="btn btn-secondary">Sign In</a>
			</div>
		</div>
	</section>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		padding: var(--space-xl) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
	}

	header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	header p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.hero {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xl);
	}

	.hero-content {
		text-align: center;
		max-width: 600px;
	}

	.hero-content h2 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: var(--space-lg);
	}

	.hero-content p {
		color: var(--color-text-muted);
		font-size: 1.125rem;
		margin-bottom: var(--space-xl);
	}

	.hero-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	.btn {
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 1rem;
		transition: all 0.15s ease;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: #4f6ce8;
		text-decoration: none;
	}

	.btn-secondary {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-elevated);
		text-decoration: none;
	}
</style>

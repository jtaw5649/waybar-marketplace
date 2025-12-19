<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<main>
	<header>
		<h1>Waybar Modules</h1>
		<div class="header-right">
			{#if data.session?.user}
				<a href="/upload" class="btn btn-small">Upload</a>
				<span class="user-name">{data.session.user.name}</span>
				<button class="btn btn-small" onclick={() => signOut()}>Sign Out</button>
			{:else}
				<a href="/login" class="btn btn-small">Sign In</a>
			{/if}
		</div>
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
				{#if data.session?.user}
					<a href="/upload" class="btn btn-secondary">Upload Module</a>
				{:else}
					<a href="/login" class="btn btn-secondary">Sign In</a>
				{/if}
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
		padding: var(--space-lg) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	header h1 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.user-name {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.btn-small {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-normal);
	}

	.btn-small:hover {
		background-color: var(--color-bg-elevated);
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

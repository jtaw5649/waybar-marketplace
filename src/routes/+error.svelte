<script lang="ts">
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<Header session={null} />

<main id="main-content">
	<div class="error-container">
		<div class="error-card">
			<div class="error-code">{page.status}</div>
			<h1>{page.error?.message || 'Something went wrong'}</h1>
			<p class="error-description">
				{#if page.status === 404}
					The page you're looking for doesn't exist or has been moved.
				{:else if page.status === 403}
					You don't have permission to access this resource.
				{:else if page.status === 500}
					An unexpected error occurred. Please try again later.
				{:else}
					An error occurred while processing your request.
				{/if}
			</p>
			<div class="error-actions">
				<a href="/" class="btn-primary">Go Home</a>
				<button class="btn-secondary" onclick={() => history.back()}>Go Back</button>
			</div>
		</div>
	</div>
</main>

<Footer />

<style>
	main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xl);
		background: linear-gradient(180deg, var(--color-bg-surface) 0%, var(--color-bg-base) 100%);
	}

	.error-container {
		width: 100%;
		max-width: 480px;
	}

	.error-card {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-2xl);
		text-align: center;
	}

	.error-code {
		font-size: 4rem;
		font-weight: 800;
		color: var(--color-text-muted);
		line-height: 1;
		margin-bottom: var(--space-md);
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: var(--space-md);
	}

	.error-description {
		color: var(--color-text-muted);
		font-size: 0.9375rem;
		line-height: 1.6;
		margin-bottom: var(--space-xl);
	}

	.error-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	.btn-primary,
	.btn-secondary {
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
		border: none;
	}

	.btn-primary:hover {
		background-color: var(--color-primary-hover);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background-color: transparent;
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-elevated);
		transform: translateY(-1px);
	}
</style>

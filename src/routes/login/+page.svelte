<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);

	const redirectTo = $derived($page.url.searchParams.get('redirectTo') || '/');

	function handleSignIn() {
		loading = true;
		signIn('github', { callbackUrl: redirectTo });
	}
</script>

<Header session={data.session} />

<main id="main-content">
	<div class="login-container">
		<div class="login-card">
			<div class="login-icon">
				<svg
					viewBox="0 0 24 24"
					width="48"
					height="48"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<line x1="3" y1="9" x2="21" y2="9" />
					<line x1="9" y1="21" x2="9" y2="9" />
				</svg>
			</div>
			<h1>Sign in to Waybar Marketplace</h1>
			<p>Sign in with your GitHub account to submit modules, write reviews, and more.</p>

			<button class="github-btn" onclick={handleSignIn} disabled={loading}>
				{#if loading}
					<svg
						class="spinner"
						viewBox="0 0 24 24"
						width="20"
						height="20"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
						<path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
					</svg>
					Signing in...
				{:else}
					<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					Continue with GitHub
				{/if}
			</button>

			<p class="terms">By signing in, you agree to our terms of service and privacy policy.</p>
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

	.login-container {
		width: 100%;
		max-width: 420px;
	}

	.login-card {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-2xl);
		text-align: center;
	}

	.login-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-xl);
	}

	.login-icon svg {
		color: white;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: var(--space-md);
	}

	.login-card > p {
		color: var(--color-text-muted);
		font-size: 0.9375rem;
		line-height: 1.6;
		margin-bottom: var(--space-xl);
	}

	.github-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-lg) var(--space-xl);
		background-color: #24292e;
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.github-btn:hover {
		background-color: #2f363d;
		transform: translateY(-1px);
	}

	.github-btn:active {
		transform: translateY(0);
	}

	.github-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.terms {
		margin-top: var(--space-lg);
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}
</style>

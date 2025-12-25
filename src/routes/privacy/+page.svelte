<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Privacy Policy · Barforge</title>
	<meta
		name="description"
		content="Privacy Policy for Barforge, the Waybar module registry and ecosystem."
	/>
</svelte:head>

<main id="main-content">
	<div class="legal-page">
		<a href="/" class="back-link" aria-label="Back to homepage">
			<ArrowLeft size={16} />
			<span>Back</span>
		</a>
		<article class="tui-panel">
			<header class="tui-panel-header">
				<span class="tui-panel-title">Privacy Policy</span>
				<span class="tui-panel-status">Effective: December 25, 2025</span>
			</header>
			<div class="tui-panel-body">
				<section>
					<h2>1. Information We Collect</h2>
					<p>
						When you sign in with GitHub OAuth, we receive basic profile information such as your
						username, display name, avatar, and email address (if provided by GitHub). We also
						collect the content you submit to the registry, including module metadata, reviews,
						ratings, and other community contributions.
					</p>
					<p>
						We may collect limited technical data (such as IP address and user agent) for security,
						abuse prevention, and operational reliability.
					</p>
				</section>

				<section>
					<h2>2. How We Use Data</h2>
					<p>
						We use your data to authenticate your account, attribute modules and reviews, operate
						the Barforge registry API, and improve the quality of the service.
					</p>
				</section>

				<section>
					<h2>3. Public Information</h2>
					<p>
						Module listings, reviews, and ratings are public. Your GitHub username and avatar are
						displayed alongside public contributions so the community can attribute work.
					</p>
				</section>

				<section>
					<h2>4. Session Storage and Preferences</h2>
					<p>
						We use essential cookies for Auth.js session management. Barforge may also use local
						storage for preferences such as starred modules or UI settings.
					</p>
				</section>

				<section>
					<h2>5. Data Sharing</h2>
					<p>
						We do not sell personal data. Data is processed by infrastructure providers such as
						Cloudflare for hosting and delivery. GitHub provides authentication services.
					</p>
				</section>

				<section>
					<h2>6. Data Retention</h2>
					<p>
						We keep account data while your account is active. Public contributions may remain
						visible to preserve registry history. You can request deletion of your account or
						content, and we will process reasonable requests subject to legal obligations.
					</p>
				</section>

				<section>
					<h2>7. Your Rights</h2>
					<p>
						You may request access, correction, or deletion of your data. To exercise your rights,
						email <a href="mailto:support@barforge.dev">support@barforge.dev</a>.
					</p>
					<p>
						For general support, contact <a href="mailto:help@barforge.dev">help@barforge.dev</a>.
						Administrative requests can be sent to
						<a href="mailto:admin@barforge.dev">admin@barforge.dev</a>.
					</p>
				</section>

				<section>
					<h2>8. Changes to This Policy</h2>
					<p>
						We may update this policy as the Barforge ecosystem evolves. The effective date will
						reflect the latest revision.
					</p>
				</section>
			</div>
		</article>
	</div>
</main>

<Footer />

<style>
	.legal-page {
		padding: var(--space-3xl) var(--space-xl);
		padding-top: var(--space-3xl);
		max-width: 800px;
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
		margin-bottom: var(--space-lg);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.back-link:hover {
		color: var(--color-primary);
		text-decoration: none;
	}

	article {
		padding: var(--space-lg);
	}

	section {
		margin-bottom: var(--space-xl);
	}

	h2 {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-normal);
		margin-bottom: var(--space-sm);
	}

	p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		line-height: 1.7;
		margin-bottom: var(--space-md);
	}

	@media (max-width: 640px) {
		.legal-page {
			padding: var(--space-xl) var(--space-md);
			padding-top: var(--space-xl);
		}

		article {
			padding: var(--space-md);
		}
	}
</style>

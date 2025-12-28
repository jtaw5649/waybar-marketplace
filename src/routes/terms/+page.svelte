<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Terms of Service · Barforge</title>
	<meta
		name="description"
		content="Terms of Service for Barforge, the Waybar module registry and ecosystem."
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
				<span class="tui-panel-title">Terms of Service</span>
				<span class="tui-panel-status">Effective: December 27, 2025</span>
			</header>
			<div class="tui-panel-body">
				<section>
					<h2>1. About Barforge</h2>
					<p>
						Barforge is a community registry for Waybar modules, plus related services like the
						Barforge desktop app and the Barforge registry API. These Terms govern your access to
						the Barforge website, API endpoints, and any linked tooling.
					</p>
				</section>

				<section>
					<h2>2. Eligibility and Accounts</h2>
					<p>
						You must be legally able to enter into these Terms. Authentication is provided via
						GitHub OAuth; your GitHub account remains subject to GitHub’s own terms and policies.
						You are responsible for activity that occurs under your account.
					</p>
				</section>

				<section>
					<h2>3. Module Submissions</h2>
					<p>
						When you submit modules or module metadata, you keep ownership of your code. You grant
						Barforge a non‑exclusive, worldwide, royalty‑free license to host, cache, display,
						distribute, and make reasonable modifications to submission data needed to operate the
						registry and related services, such as indexing and compatibility or security updates.
					</p>
					<p>
						You must include a valid SPDX license identifier and a license file or declaration with
						your submission. We may reject or remove submissions without an explicit license.
					</p>
					<p>
						If you request account deletion, we may continue to host public submissions to preserve
						registry history. We will remove or anonymize personal attribution where feasible.
					</p>
					<p>
						You confirm that you have the right to submit the content, and that your submission does
						not infringe third‑party rights or include malicious code.
					</p>
				</section>

				<section>
					<h2>4. Reviews and Community Content</h2>
					<p>
						Reviews, ratings, and comments are user content. You are responsible for what you post
						and agree to keep contributions accurate, respectful, and relevant to the modules or
						services being discussed.
					</p>
				</section>

				<section>
					<h2>5. Acceptable Use</h2>
					<p>You agree not to:</p>
					<ul>
						<li>Upload malware, exploit code, or content designed to harm users or systems.</li>
						<li>Impersonate others or misrepresent authorship of modules or reviews.</li>
						<li>Spam, scrape, or abuse API endpoints beyond reasonable usage.</li>
						<li>Violate applicable laws or third‑party policies.</li>
					</ul>
				</section>

				<section>
					<h2>6. Intellectual Property and Licensing</h2>
					<p>
						Modules remain licensed by their authors. You must include an appropriate license with
						your module. Licenses granted to Barforge and end users continue even after account
						deletion. Barforge branding and UI elements are owned by their respective rights holders
						and may not be reused without permission.
					</p>
				</section>

				<section>
					<h2>7. Availability and Changes</h2>
					<p>
						Barforge may update, suspend, or discontinue features at any time. We may remove content
						that violates these Terms or poses security or legal risk.
					</p>
				</section>

				<section>
					<h2>8. Disclaimers</h2>
					<p>
						Barforge is provided “as is” without warranties of any kind. Use of modules is at your
						own risk. We do not guarantee availability, security, or accuracy of registry content.
					</p>
				</section>

				<section>
					<h2>9. Limitation of Liability</h2>
					<p>
						To the maximum extent allowed by law, Barforge and its contributors are not liable for
						indirect, incidental, or consequential damages arising from your use of the services or
						modules.
					</p>
				</section>

				<section>
					<h2>10. Termination</h2>
					<p>
						We may suspend or terminate access if you violate these Terms. You may stop using
						Barforge at any time.
					</p>
				</section>

				<section>
					<h2>11. Contact</h2>
					<p>
						Questions about these Terms can be sent to
						<a href="mailto:support@barforge.dev">support@barforge.dev</a>.
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

	ul {
		margin: 0;
		padding-left: var(--space-lg);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		line-height: 1.7;
	}

	li {
		margin-bottom: var(--space-sm);
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

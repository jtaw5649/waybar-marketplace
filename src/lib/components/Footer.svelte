<script lang="ts">
	import { Github } from 'lucide-svelte';
</script>

<footer>
	<div class="footer-content">
		<a href="/" class="footer-brand">
			<svg
				class="footer-logo"
				width="24"
				height="24"
				viewBox="0 0 100 100"
				fill="none"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#cba6f7" />
						<stop offset="100%" stop-color="#89b4fa" />
					</linearGradient>
				</defs>
				<path d="M10 20 L90 20 L78 38 L22 38 Z" fill="url(#footerLogoGrad)" />
				<path d="M30 43 L70 43 L70 60 L30 60 Z" fill="url(#footerLogoGrad)" fill-opacity="0.9" />
				<path d="M22 65 L78 65 L90 85 L10 85 Z" fill="url(#footerLogoGrad)" fill-opacity="0.8" />
			</svg>
			<span class="footer-name">Barforge</span>
		</a>

		<nav class="footer-nav" aria-label="Footer navigation">
			<a href="/terms">Terms</a>
			<a href="/privacy">Privacy</a>
		</nav>

		<div class="footer-license">
			<a href="/barforge" class="github-link" aria-label="View source on GitHub">
				<Github size={16} />
			</a>
			<span>GPL-3.0</span>
		</div>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
		background: var(--color-bg-base);
		margin-top: auto;
	}

	.footer-content {
		max-width: var(--container-max);
		margin: 0 auto;
		padding: var(--space-xl) var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		align-items: flex-start;
	}

	@media (min-width: 768px) {
		.footer-content {
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
			gap: var(--space-lg);
		}

		.footer-license {
			justify-self: end;
		}
	}

	.footer-brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-faint);
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.footer-brand:hover {
		color: var(--color-text-normal);
		text-decoration: none;
	}

	.footer-logo {
		flex-shrink: 0;
	}

	.footer-name {
		font-family: var(--font-display);
		font-size: 0.875rem;
		font-weight: 600;
	}

	.footer-nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
	}

	.footer-nav a {
		color: var(--color-text-faint);
		font-size: 0.875rem;
		text-decoration: none;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.footer-nav a:hover {
		color: var(--color-text-normal);
	}

	.footer-license {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-text-faint);
		font-size: 0.875rem;
		opacity: 0.7;
	}

	.github-link {
		display: flex;
		color: var(--color-text-faint);
		transition: color var(--duration-fast) var(--ease-out);
	}

	.github-link:hover {
		color: var(--color-primary);
		text-decoration: none;
	}
</style>

<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer>
	<div class="footer-content">
		<div class="footer-main">
			<div class="footer-brand">
				<a
					href="https://github.com/jtaw5649/waybar-marketplace"
					target="_blank"
					rel="noopener"
					class="footer-logo"
				>
					<svg width="24" height="24" viewBox="8 8 112 112" fill="none" aria-hidden="true">
						<defs>
							<linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stop-color="#617DFA" />
								<stop offset="100%" stop-color="#8B5CF6" />
							</linearGradient>
						</defs>
						<rect
							x="10"
							y="44"
							width="108"
							height="40"
							rx="12"
							fill="var(--color-bg-elevated)"
							stroke="url(#footerLogoGrad)"
							stroke-width="4"
						/>
						<rect x="18" y="52" width="24" height="24" rx="6" fill="url(#footerLogoGrad)" />
						<rect x="48" y="52" width="36" height="24" rx="6" fill="var(--color-border)" />
						<rect
							x="90"
							y="52"
							width="20"
							height="24"
							rx="6"
							fill="var(--color-border)"
							fill-opacity="0.5"
						/>
					</svg>
					<span>Waybar Marketplace</span>
				</a>
				<p class="footer-tagline">Discover and share modules for your Waybar</p>
			</div>

			<nav class="footer-links" aria-label="Footer navigation">
				<div class="footer-section">
					<h3>Browse</h3>
					<ul>
						<li><a href="/browse">All Modules</a></li>
						<li><a href="/browse?category=system">System</a></li>
						<li><a href="/browse?category=hardware">Hardware</a></li>
						<li><a href="/browse?category=network">Network</a></li>
					</ul>
				</div>

				<div class="footer-section">
					<h3>Resources</h3>
					<ul>
						<li>
							<a
								href="https://github.com/Alexays/Waybar"
								target="_blank"
								rel="noopener"
								class="external-link"
							>
								Waybar Docs
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<path
										d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
									/>
								</svg>
							</a>
						</li>
					</ul>
				</div>
			</nav>
		</div>

		<div class="footer-bottom">
			<p>&copy; {currentYear} Waybar Marketplace.</p>
		</div>
	</div>
</footer>

<style>
	footer {
		background-color: var(--color-bg-surface);
		border-top: 1px solid var(--color-border);
		margin-top: auto;
	}

	.footer-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-2xl);
	}

	.footer-main {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2xl);
		margin-bottom: var(--space-2xl);
	}

	.footer-brand {
		max-width: 280px;
	}

	.footer-logo {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-normal);
		text-decoration: none;
		margin-bottom: var(--space-md);
	}

	.footer-logo:hover {
		color: var(--color-primary);
	}

	.footer-logo svg {
		color: var(--color-primary);
	}

	.footer-tagline {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.footer-links {
		display: flex;
		gap: var(--space-3xl);
	}

	.footer-section h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.footer-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.footer-section li {
		margin-bottom: var(--space-sm);
	}

	.footer-section a {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.footer-section a:hover {
		color: var(--color-text-normal);
	}

	.github-link,
	.external-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.external-link svg {
		opacity: 0.5;
	}

	.footer-bottom {
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-border);
	}

	.footer-bottom p {
		color: var(--color-text-faint);
		font-size: 0.8rem;
	}

	@media (max-width: 768px) {
		.footer-content {
			padding: var(--space-xl) var(--space-lg);
		}

		.footer-main {
			flex-direction: column;
			gap: var(--space-xl);
		}

		.footer-brand {
			max-width: none;
		}

		.footer-links {
			gap: var(--space-2xl);
		}
	}
</style>

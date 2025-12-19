<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer>
	<div class="footer-content">
		<div class="footer-main">
			<div class="footer-brand">
				<a href="/" class="footer-logo">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<line x1="3" y1="9" x2="21" y2="9" />
						<line x1="9" y1="21" x2="9" y2="9" />
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
							<a href="https://github.com/Alexays/Waybar" target="_blank" rel="noopener"
								>Waybar Docs</a
							>
						</li>
						<li>
							<a href="https://github.com/jtaw5649/waybar-marketplace" target="_blank" rel="noopener" class="github-link">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
								View Repository
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

	.github-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
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

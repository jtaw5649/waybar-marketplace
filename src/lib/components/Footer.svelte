<footer>
	<div class="footer-content">
		<a href="/" class="footer-brand">
			<svg
				class="footer-logo"
				width="24"
				height="24"
				viewBox="8 8 112 112"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
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
			<span class="footer-name">Barforge</span>
		</a>

		<nav class="footer-nav" aria-label="Footer navigation">
			<a href="https://github.com/jtaw5649/barforge-app" target="_blank" rel="noopener"
				>Desktop App</a
			>
			<a href="/modules">Registry</a>
			<a href="https://github.com/jtaw5649/barforge-web" target="_blank" rel="noopener"
				>GitHub</a
			>
			<a href="https://github.com/Alexays/Waybar" target="_blank" rel="noopener">Waybar</a>
		</nav>

		<div class="footer-license">GPL-3.0</div>
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
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
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
		color: var(--color-text-faint);
		font-size: 0.875rem;
		opacity: 0.7;
	}
</style>

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Footer from './Footer.svelte';

describe('Footer', () => {
	it('does not render GitHub text link in nav', () => {
		render(Footer);

		const navLinks = screen.getAllByRole('link');
		const githubTextLink = navLinks.find(
			(link) =>
				link.textContent === 'GitHub' &&
				link.getAttribute('href')?.startsWith('https://github.com/')
		);
		expect(githubTextLink).toBeUndefined();
	});

	it('renders GitHub icon link to /barforge', () => {
		const { container } = render(Footer);

		const githubLink = container.querySelector('a[href="/barforge"]');
		expect(githubLink).toBeTruthy();
		expect(githubLink?.getAttribute('aria-label')).toBe('View source on GitHub');
	});

	it('renders Terms and Privacy links', () => {
		render(Footer);

		const termsLink = screen.getByRole('link', { name: /terms/i });
		const privacyLink = screen.getByRole('link', { name: /privacy/i });

		expect(termsLink.getAttribute('href')).toBe('/terms');
		expect(privacyLink.getAttribute('href')).toBe('/privacy');
	});

	it('does not render Desktop App, Registry, or Waybar links', () => {
		render(Footer);

		expect(screen.queryByRole('link', { name: /desktop app/i })).toBeNull();
		expect(screen.queryByRole('link', { name: /^registry$/i })).toBeNull();
		expect(screen.queryByRole('link', { name: /waybar/i })).toBeNull();
	});

	it('has three-column grid layout structure', () => {
		const { container } = render(Footer);

		const footerContent = container.querySelector('.footer-content');
		expect(footerContent).toBeTruthy();

		const brand = container.querySelector('.footer-brand');
		const nav = container.querySelector('.footer-nav');
		const license = container.querySelector('.footer-license');

		expect(brand).toBeTruthy();
		expect(nav).toBeTruthy();
		expect(license).toBeTruthy();
	});
});

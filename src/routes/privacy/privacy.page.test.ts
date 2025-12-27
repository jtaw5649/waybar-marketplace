// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

describe('Privacy page', () => {
	it('renders the Privacy Policy title', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getByText(/privacy policy/i)).toBeTruthy();
	}, 15000);

	it('mentions GitHub OAuth and cookies', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getAllByText(/github oauth/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/cookies?/i).length).toBeGreaterThan(0);
	}, 15000);

	it('mentions data retention and user rights', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getByRole('heading', { name: /data retention/i })).toBeTruthy();
		expect(screen.getByRole('heading', { name: /your rights/i })).toBeTruthy();
	}, 15000);

	it('explains anonymized retention of public submissions', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getAllByText(/public contributions/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/anonym/i).length).toBeGreaterThan(0);
	}, 15000);

	it('directs privacy requests to support email and lists contact addresses', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		const supportLink = screen.getByRole('link', { name: /support@barforge.dev/i });
		const helpLink = screen.getByRole('link', { name: /help@barforge.dev/i });
		const adminLink = screen.getByRole('link', { name: /admin@barforge.dev/i });

		expect(supportLink.getAttribute('href')).toBe('mailto:support@barforge.dev');
		expect(helpLink.getAttribute('href')).toBe('mailto:help@barforge.dev');
		expect(adminLink.getAttribute('href')).toBe('mailto:admin@barforge.dev');
	}, 15000);

	it('renders back button linking to homepage', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		const backLink = screen.getByRole('link', { name: /back/i });
		expect(backLink).toBeTruthy();
		expect(backLink.getAttribute('href')).toBe('/');
	}, 15000);

	it('does not render site header', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page);

		expect(container.querySelector('.site-header')).toBeNull();
	});

	it('renders legal page without header offset', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page);

		const legalPage = container.querySelector('.legal-page');
		expect(legalPage).toBeTruthy();
	});
});

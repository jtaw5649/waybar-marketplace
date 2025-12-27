// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

describe('Terms page', () => {
	it('renders the Terms of Service title', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getByText(/terms of service/i)).toBeTruthy();
	}, 15000);

	it('mentions Waybar modules and submissions', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getAllByText(/waybar modules?/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/module submissions?/i).length).toBeGreaterThan(0);
	}, 15000);

	it('mentions GitHub authentication and the registry API', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getByText(/github oauth/i)).toBeTruthy();
		expect(screen.getByText(/registry api/i)).toBeTruthy();
	}, 15000);

	it('requires SPDX licensing for submissions', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getAllByText(/spdx/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/license/i).length).toBeGreaterThan(0);
	}, 15000);

	it('allows continued hosting after account deletion with anonymization', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		expect(screen.getAllByText(/account deletion/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/anonym/i).length).toBeGreaterThan(0);
	}, 15000);

	it('renders back button linking to homepage', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		const backLink = screen.getByRole('link', { name: /back/i });
		expect(backLink).toBeTruthy();
		expect(backLink.getAttribute('href')).toBe('/');
	}, 15000);

	it('directs terms questions to support email', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page);

		const supportLink = screen.getByRole('link', { name: /support@barforge.dev/i });
		expect(supportLink.getAttribute('href')).toBe('mailto:support@barforge.dev');
	}, 15000);

	it('does not render site header', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page);

		expect(container.querySelector('.site-header')).toBeNull();
	});
});

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

const baseData = {
	stats: { stars: 15, forks: 5, contributors: 2 }
};

describe('Barforge page', () => {
	it('renders Barforge Ecosystem heading', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getByRole('heading', { name: /barforge ecosystem/i })).toBeTruthy();
	}, 15000);

	it('renders stats section with server data values', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getAllByText('Stars').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Forks').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Contributors').length).toBeGreaterThan(0);
		expect(screen.getAllByText('15').length).toBeGreaterThan(0);
		expect(screen.getAllByText('5').length).toBeGreaterThan(0);
		expect(screen.getAllByText('2').length).toBeGreaterThan(0);
	}, 15000);

	it('renders repositories panel with repo links', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getByText('[ REPOSITORIES ]')).toBeTruthy();
		expect(screen.getByRole('link', { name: /barforge-web/i })).toBeTruthy();
		expect(screen.getByRole('link', { name: /barforge-app/i })).toBeTruthy();
	});

	it('renders tech stack panel', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getByText('[ TECH STACK ]')).toBeTruthy();
		expect(screen.getAllByText('Svelte').length).toBeGreaterThan(0);
		expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
		expect(screen.getAllByText('Rust').length).toBeGreaterThan(0);
	});

	it('renders tech stack with icons for supported technologies', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData });

		const techIcons = container.querySelectorAll('.tech-icon');
		expect(techIcons.length).toBe(4);
	});

	it('renders Iced logo from local SVG file', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData });

		const icedIcon = container.querySelector('img[src="/iced-logo.svg"]');
		expect(icedIcon).toBeTruthy();
	});

	it('does not render contribute section', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.queryByText(/want to contribute/i)).toBeNull();
	});

	it('renders back button linking to homepage', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		const backLink = screen.getByRole('link', { name: /back/i });
		expect(backLink).toBeTruthy();
		expect(backLink.getAttribute('href')).toBe('/');
	});

	it('renders footer', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getByRole('contentinfo')).toBeTruthy();
	});

	it('uses Barforge Hub and Barforge App names in intro text', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getAllByText(/barforge hub/i).length).toBeGreaterThan(0);
		expect(screen.getAllByText(/barforge app/i).length).toBeGreaterThan(0);
	});
});

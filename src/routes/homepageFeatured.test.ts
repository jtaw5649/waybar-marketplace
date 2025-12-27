// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('svelte-typewrite', () => ({
	TypeWriter: () => null
}));

describe('Homepage TUI structure', () => {
	it('renders TUI panels with correct headers', { timeout: 20000 }, async () => {
		const { default: Page } = await import('./+page.svelte');
		const landing = {
			stats: {
				total_modules: 120,
				total_downloads: 4500,
				total_authors: 35
			},
			install_methods: [
				{
					id: 'recommended',
					label: 'Pre-built binary',
					description: 'Fast install',
					commands: ['curl https://example.com | sh']
				}
			]
		};
		render(Page, {
			data: { session: null, isAdmin: false, userProfile: null, landing, error: null }
		});

		expect(screen.getByText('[ BARFORGE ]')).toBeTruthy();
		expect(screen.getByText('[ FEATURES ]')).toBeTruthy();
		expect(screen.getByText('[ DESKTOP APP ]')).toBeTruthy();
		expect(screen.getByText('[ NAVIGATION ]')).toBeTruthy();
	});
});

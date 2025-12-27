// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('svelte-typewrite', () => ({
	TypeWriter: () => null
}));

describe('Homepage layout', () => {
	it('renders TUI panel structure with navigation cards', { timeout: 20000 }, async () => {
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

		expect(document.querySelectorAll('.tui-panel').length).toBeGreaterThanOrEqual(4);
		expect(document.querySelectorAll('.tui-panel-header').length).toBeGreaterThanOrEqual(4);
		expect(document.querySelectorAll('.nav-card').length).toBeGreaterThanOrEqual(2);

		expect(screen.getByText('Browse Modules')).toBeTruthy();
		expect(screen.getByText('Publish a Module')).toBeTruthy();
	});
});

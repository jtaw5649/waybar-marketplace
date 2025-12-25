// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';

const baseData = {
	session: {
		user: {
			login: 'testuser',
			name: 'Test User',
			image: 'https://example.com/avatar.jpg'
		}
	}
};

describe('Security settings page', () => {
	it('renders security heading', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getByRole('heading', { name: /security/i })).toBeTruthy();
	}, 15000);

	it('shows export data section outside danger zone', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData });

		const dangerZone = container.querySelector('.danger-zone');
		const exportSection = container.querySelector('.data-export-section');

		expect(exportSection).toBeTruthy();
		expect(dangerZone?.contains(exportSection)).toBe(false);
	});

	it('shows delete account in danger zone', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData });

		const dangerZone = container.querySelector('.danger-zone');
		expect(dangerZone).toBeTruthy();
		expect(screen.getByRole('button', { name: /delete account/i })).toBeTruthy();
	});

	it('shows disconnect option for connected accounts', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		expect(screen.getByRole('button', { name: /log out/i })).toBeTruthy();
	});
});

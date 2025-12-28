// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import type { Module } from '$lib/types';

const baseData = {
	session: {
		user: {
			login: 'testuser',
			name: 'Test User',
			image: 'https://example.com/avatar.jpg'
		},
		expires: '2099-12-31T23:59:59.999Z'
	},
	isAdmin: false,
	userProfile: null,
	profile: null,
	modules: [] as Module[]
};

describe('Security settings page', () => {
	it('renders security heading', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData, form: null });

		expect(screen.getByRole('heading', { name: /security/i })).toBeTruthy();
	}, 15000);

	it('shows export data section outside danger zone', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData, form: null });

		const dangerZone = container.querySelector('.danger-zone');
		const exportSection = container.querySelector('.data-export-section');

		expect(exportSection).toBeTruthy();
		expect(dangerZone?.contains(exportSection)).toBe(false);
	});

	it('shows delete account in danger zone', async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData, form: null });

		const dangerZone = container.querySelector('.danger-zone');
		expect(dangerZone).toBeTruthy();
		expect(screen.getByRole('button', { name: /delete account/i })).toBeTruthy();
	});

	it('describes deletion impact on public modules', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData, form: null });

		await fireEvent.click(screen.getByRole('button', { name: /delete account/i }));

		expect(screen.getByText(/public modules may remain/i)).toBeTruthy();
		expect(screen.getByText(/anonym/i)).toBeTruthy();
	});

	it('shows disconnect option for connected accounts', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData, form: null });

		expect(screen.getByRole('button', { name: /log out/i })).toBeTruthy();
	});

	it('renders export success feedback from form data', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData, form: { success: true } });

		expect(screen.getByText(/data export has been sent/i)).toBeTruthy();
	});

	it('renders export error feedback from form data', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData, form: { message: 'Export failed' } });

		expect(screen.getByText(/export failed/i)).toBeTruthy();
	});
});

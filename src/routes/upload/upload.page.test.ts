// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';

const baseData = {
	session: {
		user: {
			login: 'testuser',
			name: 'Test User',
			image: 'https://example.com/avatar.jpg'
		},
		expires: '2099-12-31T23:59:59.999Z'
	},
	turnstileSiteKey: undefined,
	isAdmin: false,
	userProfile: null
};

describe('Upload page', () => {
	it('renders upload form', { timeout: 15000 }, async () => {
		const { default: Page } = await import('./+page.svelte');
		const { container } = render(Page, { data: baseData, form: null });

		const form = container.querySelector('form');
		expect(form).toBeTruthy();

		const licenseInput = container.querySelector(
			'input[name="license"]'
		) as HTMLInputElement | null;
		expect(licenseInput).toBeTruthy();
		expect(licenseInput?.getAttribute('pattern')).toBe('[A-Za-z0-9.+-]+');
		expect(licenseInput?.getAttribute('title')).toMatch(/SPDX/i);

		const submitButton = container.querySelector('button[type="submit"]');
		expect(submitButton).toBeTruthy();
	});
});

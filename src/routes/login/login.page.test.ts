// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

const pageState = vi.hoisted(() => ({
	url: {
		pathname: '/login',
		search: '',
		searchParams: new URLSearchParams('')
	}
}));

vi.mock('$app/state', () => ({
	page: pageState
}));

vi.mock('@auth/sveltekit/client', () => ({
	signIn: vi.fn()
}));
vi.mock('$lib/utils/sessionCleanup', () => ({ signOutWithCleanup: vi.fn() }));

const baseData = {
	session: null,
	isAdmin: false,
	userProfile: null
};

describe('Login page', () => {
	it('uses the branding avatar icon', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		const icon = document.querySelector('.login-icon img');
		expect(icon).toBeTruthy();
		expect(icon?.getAttribute('src')).toContain('/branding/avatar-');
	}, 15000);

	it('links Terms of Service and Privacy Policy', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: baseData });

		const termsLinks = screen.getAllByRole('link', { name: /terms of service/i });
		const privacyLinks = screen.getAllByRole('link', { name: /privacy policy/i });

		expect(termsLinks.some((link) => link.getAttribute('href') === '/terms')).toBe(true);
		expect(privacyLinks.some((link) => link.getAttribute('href') === '/privacy')).toBe(true);
	}, 15000);
});

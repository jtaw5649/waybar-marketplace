// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import type { Session } from '@auth/sveltekit';

const pageState = vi.hoisted(() => ({
	url: { pathname: '/', search: '' }
}));

vi.mock('$app/environment', () => ({ browser: false }));
vi.mock('$app/state', () => ({
	page: pageState
}));
vi.mock('@auth/sveltekit/client', () => ({ signOut: vi.fn() }));
vi.mock('$lib/stores/commandPalette', () => ({ open: vi.fn() }));
import Header from './Header.svelte';

describe('Header', () => {
	it('renders header with logo, navigation, search, and actions', () => {
		render(Header, { session: null });

		expect(document.querySelector('.logo')).toBeTruthy();
		expect(document.querySelector('.nav-links')).toBeTruthy();
		expect(document.querySelector('.search-trigger')).toBeTruthy();
		expect(document.querySelector('.header-actions')).toBeTruthy();
	});

	it('builds a login redirect to the current route', () => {
		pageState.url.pathname = '/modules';
		pageState.url.search = '?sort=new';

		render(Header, { session: null });

		const link = screen.getByRole('link', { name: /log in/i });
		expect(link.getAttribute('href')).toContain(
			`redirectTo=${encodeURIComponent('/modules?sort=new')}`
		);
	});

	it('shows authenticated actions when signed in', () => {
		const session = {
			user: { name: 'Nova', image: 'https://example.com/avatar.png' }
		} as Session;

		render(Header, { session });

		expect(screen.getByRole('button', { name: /open user menu/i })).toBeTruthy();
		expect(screen.queryByRole('button', { name: /log out/i })).toBeNull();
	});

	it('toggles the mobile menu when the menu button is pressed', async () => {
		const { container } = render(Header, { session: null });
		const toggle = screen.getByRole('button', { name: /open menu/i });

		await fireEvent.click(toggle);

		expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeTruthy();
		expect(container.querySelector('.mobile-menu-backdrop')).toBeTruthy();
	});

	it('displays typewriter placeholder in search trigger', () => {
		render(Header, { session: null });

		const placeholder = document.querySelector('.search-placeholder');
		expect(placeholder).toBeTruthy();
		expect((placeholder?.textContent || '').length).toBeGreaterThan(0);
	});

	it('renders Modules nav link and removes old links', () => {
		render(Header, { session: null });

		const modulesLink = screen.getByRole('link', { name: /modules/i });
		expect(modulesLink.getAttribute('href')).toBe('/modules');
		expect(screen.queryByRole('link', { name: /get started/i })).toBeNull();
		expect(screen.queryByRole('link', { name: /docs/i })).toBeNull();
		expect(screen.queryByRole('link', { name: /roadmap/i })).toBeNull();
	});

	it('renders subtitle MODULE REGISTRY', () => {
		render(Header, { session: null });

		expect(screen.getByText('MODULE REGISTRY')).toBeTruthy();
	});

	it('does not render StarsDropdown in header', () => {
		const session = {
			user: { name: 'Nova', image: 'https://example.com/avatar.png' }
		} as Session;

		const { container } = render(Header, { session });
		expect(container.querySelector('.stars-dropdown')).toBeNull();
	});

	it('places avatar dropdown at far right after theme toggle', () => {
		const session = {
			user: { name: 'Nova', image: 'https://example.com/avatar.png' }
		} as Session;

		const { container } = render(Header, { session });
		const actions = Array.from(container.querySelector('.header-actions')?.children ?? []);
		const themeIndex = actions.findIndex(
			(node) => node instanceof HTMLElement && node.classList.contains('theme-toggle')
		);
		const avatarIndex = actions.findIndex(
			(node) => node instanceof HTMLElement && node.classList.contains('avatar-dropdown')
		);

		expect(themeIndex).toBeGreaterThan(-1);
		expect(avatarIndex).toBeGreaterThan(-1);
		expect(avatarIndex).toBeGreaterThan(themeIndex);
	});

	it('logo-mark has shake animation class', () => {
		render(Header, { session: null });
		const logoMark = document.querySelector('.logo-mark');
		expect(logoMark).toBeTruthy();
	});
});

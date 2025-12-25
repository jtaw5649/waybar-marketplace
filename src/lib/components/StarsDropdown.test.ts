// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

const pageState = vi.hoisted(() => ({
	url: { pathname: '/', search: '' }
}));

const mockStarsStore = vi.hoisted(() => ({
	starred: new Set<string>(),
	isAuthenticated: false,
	getCachedModules: () =>
		[] as { uuid: string; name: string; author_username: string; icon_url?: string }[]
}));

vi.mock('$app/state', () => ({
	page: pageState
}));

vi.mock('$lib/stores/stars.svelte', () => ({
	stars: mockStarsStore
}));

vi.mock('$lib/utils/starsResponse', () => ({
	normalizeStarsPayload: <T>(data: { modules?: T[] }) => ({
		modules: data.modules || []
	})
}));

vi.mock('$lib/utils/url', () => ({
	encodeModuleUuid: (uuid: string) => uuid
}));

import StarsDropdown from './StarsDropdown.svelte';

describe('StarsDropdown', () => {
	beforeEach(() => {
		mockStarsStore.starred = new Set();
		mockStarsStore.isAuthenticated = false;
		pageState.url.pathname = '/';
		pageState.url.search = '';
		vi.clearAllMocks();
	});

	it('renders trigger button with star accessibility label', () => {
		render(StarsDropdown);

		expect(screen.getByRole('button', { name: /your starred items/i })).toBeTruthy();
	});

	it('shows no badge when star count is zero', () => {
		render(StarsDropdown);

		const badge = document.querySelector('.badge');
		expect(badge).toBeNull();
	});

	it('shows badge with star count when stars exist', () => {
		mockStarsStore.starred = new Set(['uuid-1', 'uuid-2']);
		render(StarsDropdown);

		const badge = document.querySelector('.badge');
		expect(badge?.textContent).toBe('2');
	});

	it('shows 99+ when star count exceeds 99', () => {
		const uuids = Array.from({ length: 100 }, (_, i) => `uuid-${i}`);
		mockStarsStore.starred = new Set(uuids);
		render(StarsDropdown);

		const badge = document.querySelector('.badge');
		expect(badge?.textContent).toBe('99+');
	});

	it('opens dropdown when trigger is clicked', async () => {
		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		const dropdown = document.querySelector('.dropdown');
		expect(dropdown).toBeTruthy();
	});

	it('shows empty state when no stars and dropdown is open', async () => {
		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		expect(screen.getByText('No starred items')).toBeTruthy();
	});

	it('shows local star count when unauthenticated but stars exist', async () => {
		mockStarsStore.starred = new Set(['uuid-1']);
		mockStarsStore.isAuthenticated = false;
		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		expect(screen.getByText(/you have 1 starred item/i)).toBeTruthy();
		expect(screen.getByText(/log in to see details/i)).toBeTruthy();
	});

	it('has view all stars link in footer', async () => {
		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		const link = screen.getByRole('link', { name: /view all stars/i });
		expect(link).toBeTruthy();
	});

	it('sets aria-expanded correctly on trigger', async () => {
		render(StarsDropdown);

		const button = screen.getByRole('button', { name: /your starred items/i });
		expect(button.getAttribute('aria-expanded')).toBe('false');

		await fireEvent.click(button);
		expect(button.getAttribute('aria-expanded')).toBe('true');
	});

	it('displays header with star count in dropdown', async () => {
		mockStarsStore.starred = new Set(['uuid-1', 'uuid-2', 'uuid-3']);
		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		expect(screen.getByText('Your Stars')).toBeTruthy();
		const countInHeader = document.querySelector('.dropdown-header .count');
		expect(countInHeader?.textContent).toBe('3');
	});

	it('fetches and displays starred items when authenticated', async () => {
		mockStarsStore.starred = new Set(['uuid-1']);
		mockStarsStore.isAuthenticated = true;

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				modules: [{ uuid: 'uuid-1', name: 'Test Module', author_username: 'testuser' }]
			})
		});

		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText('Test Module')).toBeTruthy();
			expect(screen.getByText('by testuser')).toBeTruthy();
		});
	});

	it('shows loading spinner while fetching stars', async () => {
		mockStarsStore.starred = new Set(['uuid-1']);
		mockStarsStore.isAuthenticated = true;

		let resolvePromise: (value: unknown) => void;
		const fetchPromise = new Promise((resolve) => {
			resolvePromise = resolve;
		});

		global.fetch = vi.fn().mockReturnValue(fetchPromise);

		render(StarsDropdown);

		const trigger = screen.getByRole('button', { name: /your starred items/i });
		await fireEvent.click(trigger);

		expect(document.querySelector('.spinner')).toBeTruthy();

		resolvePromise!({
			ok: true,
			json: async () => ({ modules: [] })
		});
	});
});

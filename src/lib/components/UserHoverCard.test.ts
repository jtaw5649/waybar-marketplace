// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import UserHoverCard from './UserHoverCard.svelte';
import { userCache } from '$lib/stores/userCache.svelte';

describe('UserHoverCard', () => {
	beforeEach(() => {
		userCache.clear();
		vi.resetAllMocks();
	});

	it('shows loading state initially', () => {
		global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

		render(UserHoverCard, { props: { username: 'testuser' } });

		expect(screen.getByText(/loading/i)).toBeTruthy();
	});

	it('displays user data after fetch', async () => {
		const mockProfile = {
			version: 1,
			data: {
				username: 'testuser',
				display_name: 'Test User',
				avatar_url: 'https://example.com/avatar.png',
				bio: 'A test user',
				verified_author: false,
				module_count: 5
			}
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockProfile)
		});

		render(UserHoverCard, { props: { username: 'testuser' } });

		const displayName = await screen.findByText('Test User');
		expect(displayName).toBeTruthy();
		expect(screen.getByText('@testuser')).toBeTruthy();
		expect(screen.getByText('A test user')).toBeTruthy();
		expect(screen.getByText(/5 modules/i)).toBeTruthy();
	});

	it('shows verified badge for verified authors', async () => {
		const mockProfile = {
			version: 1,
			data: {
				username: 'verified',
				display_name: 'Verified Author',
				verified_author: true,
				module_count: 10
			}
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockProfile)
		});

		render(UserHoverCard, { props: { username: 'verified' } });

		await screen.findByText('Verified Author');
		expect(screen.getByTitle(/verified/i)).toBeTruthy();
	});

	it('uses cached data without fetching', async () => {
		userCache.set('cached', {
			username: 'cached',
			display_name: 'Cached User',
			verified_author: false,
			module_count: 3
		});

		global.fetch = vi.fn();

		render(UserHoverCard, { props: { username: 'cached' } });

		await screen.findByText('Cached User');
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it('displays avatar when available', async () => {
		const mockProfile = {
			version: 1,
			data: {
				username: 'avataruser',
				avatar_url: 'https://example.com/avatar.png',
				verified_author: false,
				module_count: 2
			}
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockProfile)
		});

		render(UserHoverCard, { props: { username: 'avataruser' } });

		const avatar = await screen.findByRole('img');
		expect(avatar).toBeTruthy();
		expect(avatar.getAttribute('src')).toBe('https://example.com/avatar.png');
	});

	it('includes View Profile link', async () => {
		const mockProfile = {
			version: 1,
			data: {
				username: 'linkuser',
				verified_author: false,
				module_count: 0
			}
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockProfile)
		});

		render(UserHoverCard, { props: { username: 'linkuser' } });

		const link = await screen.findByRole('link', { name: /view profile/i });
		expect(link.getAttribute('href')).toBe('/users/linkuser');
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load } from './+page.server';

type LoadEvent = Parameters<typeof load>[0];

describe('user profile page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('does not expose accessToken in returned session', async () => {
		const profileData = {
			id: 1,
			username: 'testuser',
			display_name: 'Test User',
			avatar_url: null,
			bio: null,
			website_url: null,
			github_url: null,
			twitter_url: null,
			bluesky_url: null,
			discord_url: null,
			sponsor_url: null,
			verified_author: false,
			module_count: 0,
			created_at: '2024-01-01'
		};

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'testuser' },
					accessToken: 'secret-token-should-not-leak'
				})
			},
			params: { username: 'testuser' },
			fetch: vi.fn().mockImplementation((url: string) => {
				if (url.includes('/api/v1/users/testuser/modules')) {
					return Promise.resolve({
						ok: true,
						json: async () => ({ modules: [] })
					});
				}
				if (url.includes('/api/v1/users/testuser/collections')) {
					return Promise.resolve({
						ok: true,
						json: async () => ({ collections: [] })
					});
				}
				return Promise.resolve({
					ok: true,
					json: async () => profileData
				});
			})
		} as unknown as LoadEvent;

		const result = await load(event);
		if (!result) throw new Error('expected result');

		expect(result.session).toBeDefined();
		expect(result.session).not.toHaveProperty('accessToken');
	});
});

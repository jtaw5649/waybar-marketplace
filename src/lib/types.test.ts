import { describe, it, expect } from 'vitest';
import type { UserProfile } from './types';

describe('UserProfile type', () => {
	it('includes social link fields', () => {
		const profile: UserProfile = {
			id: 1,
			username: 'testuser',
			display_name: 'Test User',
			avatar_url: null,
			bio: null,
			website_url: null,
			verified_author: false,
			module_count: 0,
			created_at: '2024-01-01T00:00:00Z',
			github_url: 'https://github.com/testuser',
			twitter_url: 'https://x.com/testuser',
			bluesky_url: 'https://bsky.app/profile/testuser.bsky.social',
			discord_url: 'https://discord.gg/abc123',
			sponsor_url: 'https://github.com/sponsors/testuser'
		};

		expect(profile.github_url).toBe('https://github.com/testuser');
		expect(profile.twitter_url).toBe('https://x.com/testuser');
		expect(profile.bluesky_url).toBe('https://bsky.app/profile/testuser.bsky.social');
		expect(profile.discord_url).toBe('https://discord.gg/abc123');
		expect(profile.sponsor_url).toBe('https://github.com/sponsors/testuser');
	});
});

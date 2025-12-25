// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userCache, type CachedUser } from './userCache.svelte';

const mockUser: CachedUser = {
	username: 'testuser',
	display_name: 'Test User',
	avatar_url: 'https://example.com/avatar.png',
	bio: 'A test user',
	verified_author: true,
	module_count: 5
};

describe('userCache', () => {
	beforeEach(() => {
		userCache.clear();
	});

	it('returns null for uncached user', () => {
		expect(userCache.get('nonexistent')).toBeNull();
	});

	it('stores and retrieves user data', () => {
		userCache.set('testuser', mockUser);
		expect(userCache.get('testuser')).toEqual(mockUser);
	});

	it('expires cache after TTL', () => {
		vi.useFakeTimers();

		userCache.set('testuser', mockUser);
		expect(userCache.get('testuser')).toEqual(mockUser);

		vi.advanceTimersByTime(5 * 60 * 1000 + 1);
		expect(userCache.get('testuser')).toBeNull();

		vi.useRealTimers();
	});

	it('has() returns true for cached user', () => {
		userCache.set('testuser', mockUser);
		expect(userCache.has('testuser')).toBe(true);
	});
});

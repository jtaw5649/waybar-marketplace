import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const mocks = vi.hoisted(() => ({
	signOut: vi.fn(),
	notificationStore: { reset: vi.fn() },
	stars: { clearLocalState: vi.fn() },
	pinnedModules: { clear: vi.fn() },
	recentlyViewed: { clear: vi.fn() },
	searchPreferences: { reset: vi.fn() },
	userCache: { clear: vi.fn() }
}));

vi.mock('$app/environment', () => ({ browser: true }));
vi.mock('@auth/sveltekit/client', () => ({ signOut: mocks.signOut }));
vi.mock('$lib/stores/notifications.svelte', () => ({
	notificationStore: mocks.notificationStore
}));
vi.mock('$lib/stores/stars.svelte', () => ({ stars: mocks.stars }));
vi.mock('$lib/stores/pinnedModules', () => ({ pinnedModules: mocks.pinnedModules }));
vi.mock('$lib/stores/recentlyViewed', () => ({ recentlyViewed: mocks.recentlyViewed }));
vi.mock('$lib/stores/searchPreferences', () => ({ searchPreferences: mocks.searchPreferences }));
vi.mock('$lib/stores/userCache.svelte', () => ({ userCache: mocks.userCache }));

import { clearUserLocalState, signOutWithCleanup } from './sessionCleanup';

describe('sessionCleanup', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	it('clears user-specific local state', () => {
		localStorageMock.setItem('barforge:notification-preferences', '[]');
		localStorageMock.setItem('starred_modules', '["uuid-1"]');
		localStorageMock.setItem('pinned_modules', '["uuid-2"]');
		localStorageMock.setItem('recently_viewed_modules', '[]');
		localStorageMock.setItem('browse_preferences', '{"sort":"new"}');

		clearUserLocalState();

		expect(localStorageMock.getItem('barforge:notification-preferences')).toBeNull();
		expect(localStorageMock.getItem('starred_modules')).toBeNull();
		expect(localStorageMock.getItem('pinned_modules')).toBeNull();
		expect(localStorageMock.getItem('recently_viewed_modules')).toBeNull();
		expect(localStorageMock.getItem('browse_preferences')).toBeNull();
		expect(mocks.stars.clearLocalState).toHaveBeenCalled();
		expect(mocks.pinnedModules.clear).toHaveBeenCalled();
		expect(mocks.recentlyViewed.clear).toHaveBeenCalled();
		expect(mocks.searchPreferences.reset).toHaveBeenCalled();
		expect(mocks.notificationStore.reset).toHaveBeenCalled();
		expect(mocks.userCache.clear).toHaveBeenCalled();
	});

	it('signs out after clearing local state', async () => {
		await signOutWithCleanup({ redirectTo: '/' });

		expect(mocks.stars.clearLocalState).toHaveBeenCalled();
		expect(mocks.signOut).toHaveBeenCalledWith({ redirectTo: '/' });
	});
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({
	browser: true
}));

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('searchPreferences store', () => {
	beforeEach(async () => {
		localStorageMock.clear();
		vi.resetModules();
	});

	it('starts with default preferences', async () => {
		const { searchPreferences } = await import('./searchPreferences');
		const prefs = get(searchPreferences);
		expect(prefs.sort).toBe('popular');
		expect(prefs.category).toBe('');
	});

	it('updates sort preference', async () => {
		const { searchPreferences } = await import('./searchPreferences');
		searchPreferences.setSort('recent');
		expect(get(searchPreferences).sort).toBe('recent');
	});

	it('updates category preference', async () => {
		const { searchPreferences } = await import('./searchPreferences');
		searchPreferences.setCategory('theme');
		expect(get(searchPreferences).category).toBe('theme');
	});

	it('persists to localStorage', async () => {
		const { searchPreferences } = await import('./searchPreferences');
		searchPreferences.setSort('downloads');
		searchPreferences.setCategory('system');
		const stored = JSON.parse(localStorageMock.getItem('browse_preferences') || '{}');
		expect(stored.sort).toBe('downloads');
		expect(stored.category).toBe('system');
	});

	it('resets to defaults', async () => {
		const { searchPreferences } = await import('./searchPreferences');
		searchPreferences.setSort('recent');
		searchPreferences.setCategory('theme');
		searchPreferences.reset();
		const prefs = get(searchPreferences);
		expect(prefs.sort).toBe('popular');
		expect(prefs.category).toBe('');
	});

	it('loads existing preferences from localStorage', async () => {
		localStorageMock.setItem(
			'browse_preferences',
			JSON.stringify({ sort: 'trending', category: 'audio' })
		);
		vi.resetModules();
		const { searchPreferences } = await import('./searchPreferences');
		const prefs = get(searchPreferences);
		expect(prefs.sort).toBe('trending');
		expect(prefs.category).toBe('audio');
	});
});

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

function makeUuid(n: number): string {
	const hex = n.toString(16).padStart(12, '0');
	return `00000000-0000-0000-0000-${hex}`;
}

const createTestModule = (id: number) => ({
	uuid: makeUuid(id),
	name: `Module ${id}`,
	author: 'testuser',
	description: 'Test description',
	category: 'theme',
	downloads: 100,
	verified_author: false
});

describe('recentlyViewed store', () => {
	beforeEach(async () => {
		localStorageMock.clear();
		vi.resetModules();
	});

	it('starts with empty array', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		expect(get(recentlyViewed)).toEqual([]);
	});

	it('adds a module to recently viewed list', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		const module = createTestModule(1);
		recentlyViewed.add(module);
		const list = get(recentlyViewed);
		expect(list).toHaveLength(1);
		expect(list[0].uuid).toBe(makeUuid(1));
		expect(list[0].viewedAt).toBeDefined();
	});

	it('accepts module-style uuids', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		recentlyViewed.add({
			uuid: 'cpu-temp@system',
			name: 'CPU Temp',
			author: 'system',
			description: 'CPU temp module',
			category: 'system',
			downloads: 0,
			verified_author: false
		});
		const list = get(recentlyViewed);
		expect(list).toHaveLength(1);
		expect(list[0].uuid).toBe('cpu-temp@system');
	});

	it('moves existing module to front on re-view', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		recentlyViewed.add(createTestModule(1));
		recentlyViewed.add(createTestModule(2));
		recentlyViewed.add(createTestModule(1));
		const list = get(recentlyViewed);
		expect(list).toHaveLength(2);
		expect(list[0].uuid).toBe(makeUuid(1));
		expect(list[1].uuid).toBe(makeUuid(2));
	});

	it('removes a module from recently viewed list', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		recentlyViewed.add(createTestModule(1));
		recentlyViewed.add(createTestModule(2));
		recentlyViewed.remove(makeUuid(1));
		const list = get(recentlyViewed);
		expect(list).toHaveLength(1);
		expect(list[0].uuid).toBe(makeUuid(2));
	});

	it('limits to MAX_RECENTLY_VIEWED modules', async () => {
		const { recentlyViewed, MAX_RECENTLY_VIEWED } = await import('./recentlyViewed');
		for (let i = 0; i < MAX_RECENTLY_VIEWED + 5; i++) {
			recentlyViewed.add(createTestModule(i));
		}
		expect(get(recentlyViewed)).toHaveLength(MAX_RECENTLY_VIEWED);
	});

	it('keeps most recent modules when at limit', async () => {
		const { recentlyViewed, MAX_RECENTLY_VIEWED } = await import('./recentlyViewed');
		for (let i = 0; i < MAX_RECENTLY_VIEWED + 2; i++) {
			recentlyViewed.add(createTestModule(i));
		}
		const list = get(recentlyViewed);
		expect(list[0].uuid).toBe(makeUuid(MAX_RECENTLY_VIEWED + 1));
	});

	it('clears all recently viewed modules', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		recentlyViewed.add(createTestModule(1));
		recentlyViewed.add(createTestModule(2));
		recentlyViewed.clear();
		expect(get(recentlyViewed)).toEqual([]);
	});

	it('persists to localStorage', async () => {
		const { recentlyViewed } = await import('./recentlyViewed');
		recentlyViewed.add(createTestModule(1));
		const stored = JSON.parse(localStorageMock.getItem('recently_viewed_modules') || '[]');
		expect(stored).toHaveLength(1);
		expect(stored[0].uuid).toBe(makeUuid(1));
	});
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({
	browser: true
}));

const mockLocalStorage = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		get store() {
			return store;
		}
	};
})();

Object.defineProperty(globalThis, 'localStorage', {
	value: mockLocalStorage,
	writable: true
});

describe('favorites store', () => {
	beforeEach(async () => {
		mockLocalStorage.clear();
		vi.resetModules();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	async function getFavoritesStore() {
		const { favorites, isFavorite } = await import('./favorites');
		return { favorites, isFavorite };
	}

	describe('initial state', () => {
		it('starts with empty favorites when localStorage is empty', async () => {
			const { favorites } = await getFavoritesStore();
			expect(get(favorites).size).toBe(0);
		});

		it('loads favorites from localStorage on init', async () => {
			mockLocalStorage.setItem('favorites', JSON.stringify(['uuid-1', 'uuid-2']));
			const { favorites } = await getFavoritesStore();
			const faves = get(favorites);
			expect(faves.size).toBe(2);
			expect(faves.has('uuid-1')).toBe(true);
			expect(faves.has('uuid-2')).toBe(true);
		});

		it('handles invalid JSON in localStorage gracefully', async () => {
			mockLocalStorage.setItem('favorites', 'invalid-json');
			const { favorites } = await getFavoritesStore();
			expect(get(favorites).size).toBe(0);
		});
	});

	describe('add', () => {
		it('adds a uuid to favorites', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(true);
		});

		it('persists to localStorage', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
				'favorites',
				JSON.stringify(['test-uuid'])
			);
		});

		it('does not duplicate existing uuid', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			favorites.add('test-uuid');
			expect(get(favorites).size).toBe(1);
		});

		it('adds multiple different uuids', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('uuid-1');
			favorites.add('uuid-2');
			favorites.add('uuid-3');
			expect(get(favorites).size).toBe(3);
		});
	});

	describe('remove', () => {
		it('removes a uuid from favorites', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			favorites.remove('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(false);
		});

		it('persists removal to localStorage', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			favorites.remove('test-uuid');
			expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('favorites', JSON.stringify([]));
		});

		it('handles removing non-existent uuid gracefully', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.remove('non-existent');
			expect(get(favorites).size).toBe(0);
		});
	});

	describe('toggle', () => {
		it('adds uuid when not present', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.toggle('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(true);
		});

		it('removes uuid when present', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			favorites.toggle('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(false);
		});

		it('toggles correctly multiple times', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.toggle('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(true);
			favorites.toggle('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(false);
			favorites.toggle('test-uuid');
			expect(get(favorites).has('test-uuid')).toBe(true);
		});
	});

	describe('has', () => {
		it('returns true for existing uuid', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			expect(favorites.has('test-uuid')).toBe(true);
		});

		it('returns false for non-existing uuid', async () => {
			const { favorites } = await getFavoritesStore();
			expect(favorites.has('non-existent')).toBe(false);
		});
	});

	describe('clear', () => {
		it('removes all favorites', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('uuid-1');
			favorites.add('uuid-2');
			favorites.add('uuid-3');
			favorites.clear();
			expect(get(favorites).size).toBe(0);
		});

		it('persists clear to localStorage', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('uuid-1');
			favorites.clear();
			expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('favorites', JSON.stringify([]));
		});
	});

	describe('isFavorite helper', () => {
		it('returns a derived store that tracks favorite status', async () => {
			const { favorites, isFavorite } = await getFavoritesStore();
			const derivedStore = isFavorite('test-uuid');
			expect(get(derivedStore)).toBe(false);
			favorites.add('test-uuid');
			expect(get(derivedStore)).toBe(true);
			favorites.remove('test-uuid');
			expect(get(derivedStore)).toBe(false);
		});

		it('tracks different uuids independently', async () => {
			const { favorites, isFavorite } = await getFavoritesStore();
			const isFav1 = isFavorite('uuid-1');
			const isFav2 = isFavorite('uuid-2');
			favorites.add('uuid-1');
			expect(get(isFav1)).toBe(true);
			expect(get(isFav2)).toBe(false);
		});
	});

	describe('subscription', () => {
		it('notifies subscribers when favorite is added', async () => {
			const { favorites } = await getFavoritesStore();
			const values: Set<string>[] = [];
			const unsubscribe = favorites.subscribe((v) => values.push(new Set(v)));
			favorites.add('test-uuid');
			expect(values.length).toBe(2);
			expect(values[1].has('test-uuid')).toBe(true);
			unsubscribe();
		});

		it('notifies subscribers when favorite is removed', async () => {
			const { favorites } = await getFavoritesStore();
			favorites.add('test-uuid');
			const values: Set<string>[] = [];
			const unsubscribe = favorites.subscribe((v) => values.push(new Set(v)));
			favorites.remove('test-uuid');
			expect(values.length).toBe(2);
			expect(values[1].has('test-uuid')).toBe(false);
			unsubscribe();
		});
	});
});

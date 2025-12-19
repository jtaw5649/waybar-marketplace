import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

function getStoredFavorites(): Set<string> {
	if (!browser) return new Set();
	const stored = localStorage.getItem('favorites');
	if (stored) {
		try {
			return new Set(JSON.parse(stored));
		} catch {
			return new Set();
		}
	}
	return new Set();
}

function createFavoritesStore() {
	const initial = getStoredFavorites();
	const { subscribe, update, set } = writable<Set<string>>(initial);

	function persist(favorites: Set<string>) {
		if (browser) {
			localStorage.setItem('favorites', JSON.stringify([...favorites]));
		}
	}

	return {
		subscribe,
		add: (uuid: string) => {
			update((favorites) => {
				const next = new Set(favorites);
				next.add(uuid);
				persist(next);
				return next;
			});
		},
		remove: (uuid: string) => {
			update((favorites) => {
				const next = new Set(favorites);
				next.delete(uuid);
				persist(next);
				return next;
			});
		},
		toggle: (uuid: string) => {
			update((favorites) => {
				const next = new Set(favorites);
				if (next.has(uuid)) {
					next.delete(uuid);
				} else {
					next.add(uuid);
				}
				persist(next);
				return next;
			});
		},
		has: (uuid: string) => {
			let result = false;
			const unsubscribe = subscribe((favorites) => {
				result = favorites.has(uuid);
			});
			unsubscribe();
			return result;
		},
		clear: () => {
			set(new Set());
			persist(new Set());
		}
	};
}

export const favorites = createFavoritesStore();

export function isFavorite(uuid: string) {
	return derived(favorites, ($favorites) => $favorites.has(uuid));
}

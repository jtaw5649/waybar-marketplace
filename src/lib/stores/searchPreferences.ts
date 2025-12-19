import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'browse_preferences';

export interface SearchPreferences {
	sort: string;
	category: string;
}

const DEFAULT_PREFERENCES: SearchPreferences = {
	sort: 'popular',
	category: ''
};

function createSearchPreferencesStore() {
	const initial: SearchPreferences = browser
		? { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
		: DEFAULT_PREFERENCES;

	const { subscribe, set, update } = writable<SearchPreferences>(initial);

	return {
		subscribe,
		setSort(sort: string) {
			update((prefs) => {
				const updated = { ...prefs, sort };
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		setCategory(category: string) {
			update((prefs) => {
				const updated = { ...prefs, category };
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		reset() {
			set(DEFAULT_PREFERENCES);
			if (browser) localStorage.removeItem(STORAGE_KEY);
		}
	};
}

export const searchPreferences = createSearchPreferencesStore();

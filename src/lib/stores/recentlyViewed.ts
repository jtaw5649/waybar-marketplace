import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'recently_viewed_modules';
const MAX_RECENT = 10;

export interface RecentModule {
	uuid: string;
	name: string;
	author: string;
	description: string;
	category: string;
	downloads: number;
	verified_author: boolean;
	version?: string;
	viewedAt: number;
}

function createRecentlyViewedStore() {
	const initial: RecentModule[] = browser
		? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		: [];

	const { subscribe, set, update } = writable<RecentModule[]>(initial);

	return {
		subscribe,
		add(module: Omit<RecentModule, 'viewedAt'>) {
			update((modules) => {
				const filtered = modules.filter((m) => m.uuid !== module.uuid);
				const updated = [{ ...module, viewedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		remove(uuid: string) {
			update((modules) => {
				const updated = modules.filter((m) => m.uuid !== uuid);
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		clear() {
			set([]);
			if (browser) localStorage.removeItem(STORAGE_KEY);
		}
	};
}

export const recentlyViewed = createRecentlyViewedStore();
export const MAX_RECENTLY_VIEWED = MAX_RECENT;

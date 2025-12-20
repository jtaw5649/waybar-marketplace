import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'recently_viewed_modules';
const MAX_RECENT = 10;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function isValidUuid(uuid: string): boolean {
	return UUID_REGEX.test(uuid);
}

function createRecentlyViewedStore() {
	const stored: RecentModule[] = browser
		? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		: [];
	const initial = stored.filter((m) => isValidUuid(m.uuid));

	const { subscribe, set, update } = writable<RecentModule[]>(initial);

	return {
		subscribe,
		add(module: Omit<RecentModule, 'viewedAt'>) {
			if (!isValidUuid(module.uuid)) {
				console.warn('Invalid UUID for recently viewed module:', module.uuid);
				return;
			}
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

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'pinned_modules';
const MAX_PINNED = 6;

function createPinnedModulesStore() {
	const initial: string[] = browser ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') : [];

	const { subscribe, set, update } = writable<string[]>(initial);

	return {
		subscribe,
		add(uuid: string) {
			update((modules) => {
				if (modules.includes(uuid)) return modules;
				if (modules.length >= MAX_PINNED) return modules;
				const updated = [...modules, uuid];
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		remove(uuid: string) {
			update((modules) => {
				const updated = modules.filter((id) => id !== uuid);
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		toggle(uuid: string) {
			update((modules) => {
				let updated: string[];
				if (modules.includes(uuid)) {
					updated = modules.filter((id) => id !== uuid);
				} else {
					if (modules.length >= MAX_PINNED) return modules;
					updated = [...modules, uuid];
				}
				if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
				return updated;
			});
		},
		isPinned(uuid: string, pinnedList: string[]): boolean {
			return pinnedList.includes(uuid);
		},
		canPin(pinnedList: string[]): boolean {
			return pinnedList.length < MAX_PINNED;
		},
		clear() {
			set([]);
			if (browser) localStorage.removeItem(STORAGE_KEY);
		}
	};
}

export const pinnedModules = createPinnedModulesStore();
export const MAX_PINNED_MODULES = MAX_PINNED;

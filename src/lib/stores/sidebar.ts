import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'sidebar-collapsed';

function getStoredCollapsed(): boolean {
	if (!browser) return false;
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored === 'true';
}

function createSidebarStore() {
	const initial = getStoredCollapsed();
	const { subscribe, set } = writable<boolean>(initial);

	function persist(collapsed: boolean) {
		if (browser) {
			localStorage.setItem(STORAGE_KEY, String(collapsed));
		}
	}

	return {
		subscribe,
		set: (collapsed: boolean) => {
			set(collapsed);
			persist(collapsed);
		},
		toggle: () => {
			const current = getStoredCollapsed();
			const next = !current;
			set(next);
			persist(next);
		},
		expand: () => {
			set(false);
			persist(false);
		},
		collapse: () => {
			set(true);
			persist(true);
		}
	};
}

export const sidebarCollapsed = createSidebarStore();

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ViewMode = 'grid' | 'list';

const STORAGE_KEY = 'browse-view-mode';

function getStoredViewMode(): ViewMode {
	if (!browser) return 'grid';
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'grid' || stored === 'list') {
		return stored;
	}
	return 'grid';
}

function createViewModeStore() {
	const initial = getStoredViewMode();
	const { subscribe, set } = writable<ViewMode>(initial);

	return {
		subscribe,
		set: (mode: ViewMode) => {
			set(mode);
			if (browser) {
				localStorage.setItem(STORAGE_KEY, mode);
			}
		},
		toggle: () => {
			const current = getStoredViewMode();
			const next: ViewMode = current === 'grid' ? 'list' : 'grid';
			set(next);
			if (browser) {
				localStorage.setItem(STORAGE_KEY, next);
			}
		}
	};
}

export const viewMode = createViewModeStore();

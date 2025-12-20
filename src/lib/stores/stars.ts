import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'starred_modules';

function getStoredStars(): Set<string> {
	if (!browser) return new Set();
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return new Set(JSON.parse(stored));
		} catch {
			return new Set();
		}
	}
	return new Set();
}

function persistStars(stars: Set<string>) {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...stars]));
	}
}

interface StarsState {
	starred: Set<string>;
	starCounts: Map<string, number>;
	isAuthenticated: boolean;
	syncing: boolean;
}

function createStarsStore() {
	const initial: StarsState = {
		starred: getStoredStars(),
		starCounts: new Map(),
		isAuthenticated: false,
		syncing: false
	};

	const store = writable<StarsState>(initial);

	async function syncWithServer() {
		store.update((s) => ({ ...s, syncing: true }));

		try {
			const res = await fetch('/api/stars');
			if (res.ok) {
				const data = await res.json();
				const serverStars = new Set<string>(
					(data.data?.modules || []).map((m: { uuid: string }) => m.uuid)
				);

				store.update((s) => {
					const merged = new Set([...s.starred, ...serverStars]);
					persistStars(merged);
					return {
						...s,
						starred: merged,
						isAuthenticated: true,
						syncing: false
					};
				});

				const localStars = get(store).starred;
				for (const uuid of localStars) {
					if (!serverStars.has(uuid)) {
						fetch(`/api/modules/${encodeURIComponent(uuid)}/star`, {
							method: 'POST'
						}).catch(() => {});
					}
				}
			}
		} catch {
			store.update((s) => ({ ...s, syncing: false }));
		}
	}

	async function toggle(uuid: string): Promise<boolean> {
		const current = get(store);
		const wasStarred = current.starred.has(uuid);
		const newStarred = new Set(current.starred);

		if (wasStarred) {
			newStarred.delete(uuid);
		} else {
			newStarred.add(uuid);
		}

		store.update((s) => ({ ...s, starred: newStarred }));
		persistStars(newStarred);

		if (current.isAuthenticated) {
			try {
				const res = await fetch(`/api/modules/${encodeURIComponent(uuid)}/star`, {
					method: wasStarred ? 'DELETE' : 'POST'
				});

				if (!res.ok) {
					store.update((s) => ({ ...s, starred: current.starred }));
					persistStars(current.starred);
					return wasStarred;
				}
			} catch {
				store.update((s) => ({ ...s, starred: current.starred }));
				persistStars(current.starred);
				return wasStarred;
			}
		}

		return !wasStarred;
	}

	function setStarCount(uuid: string, count: number) {
		store.update((s) => {
			const newCounts = new Map(s.starCounts);
			newCounts.set(uuid, count);
			return { ...s, starCounts: newCounts };
		});
	}

	function setAuthenticated(value: boolean) {
		store.update((s) => ({ ...s, isAuthenticated: value }));
		if (value && browser) {
			syncWithServer();
		}
	}

	return {
		subscribe: store.subscribe,
		toggle,
		setStarCount,
		setAuthenticated,
		syncWithServer,
		isStarred: (uuid: string) => derived(store, ($store) => $store.starred.has(uuid)),
		getStarCount: (uuid: string) => derived(store, ($store) => $store.starCounts.get(uuid) ?? 0),
		starredUuids: derived(store, ($store) => [...$store.starred])
	};
}

export const stars = createStarsStore();

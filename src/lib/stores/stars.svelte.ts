import { browser } from '$app/environment';
import { normalizeStarsPayload } from '$lib/utils/starsResponse';
import { SvelteSet, SvelteMap } from 'svelte/reactivity';

const STORAGE_KEY = 'starred_modules';

function getStoredStars(): string[] {
	if (!browser) return [];
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch {
			return [];
		}
	}
	return [];
}

function persistStars(stars: SvelteSet<string>) {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...stars]));
	}
}

class StarsStore {
	starred = new SvelteSet<string>(getStoredStars());
	starCounts = new SvelteMap<string, number>();
	isAuthenticated = $state(false);
	syncing = $state(false);

	starredUuids = $derived([...this.starred]);

	constructor() {}

	isStarred(uuid: string) {
		return this.starred.has(uuid);
	}

	getStarCount(uuid: string) {
		return this.starCounts.get(uuid) ?? 0;
	}

	async syncWithServer() {
		this.syncing = true;

		try {
			const res = await fetch('/api/stars');
			if (res.ok) {
				const data = await res.json();
				const payload = normalizeStarsPayload<{ uuid: string }>(data);
				const serverStars = new Set<string>(payload.modules.map((m) => m.uuid));

				const merged = new Set([...this.starred, ...serverStars]);

				this.starred.clear();
				for (const s of merged) this.starred.add(s);

				persistStars(this.starred);
				this.isAuthenticated = true;

				for (const uuid of merged) {
					if (!serverStars.has(uuid)) {
						fetch(`/api/modules/${encodeURIComponent(uuid)}/star`, {
							method: 'POST'
						}).catch(() => {});
					}
				}
			}
		} catch (error) {
			console.error('Failed to sync stars:', error);
		} finally {
			this.syncing = false;
		}
	}

	async toggle(uuid: string): Promise<boolean> {
		const wasStarred = this.starred.has(uuid);

		if (wasStarred) {
			this.starred.delete(uuid);
		} else {
			this.starred.add(uuid);
		}

		persistStars(this.starred);

		if (this.isAuthenticated) {
			try {
				const res = await fetch(`/api/modules/${encodeURIComponent(uuid)}/star`, {
					method: wasStarred ? 'DELETE' : 'POST'
				});

				if (!res.ok) {
					if (wasStarred) this.starred.add(uuid);
					else this.starred.delete(uuid);

					persistStars(this.starred);
					return wasStarred;
				}
			} catch (error) {
				console.error('Failed to toggle star:', error);
				if (wasStarred) this.starred.add(uuid);
				else this.starred.delete(uuid);

				persistStars(this.starred);
				return wasStarred;
			}
		}

		return !wasStarred;
	}

	setStarCount(uuid: string, count: number) {
		this.starCounts.set(uuid, count);
	}

	setAuthenticated(value: boolean) {
		this.isAuthenticated = value;
		if (value && browser) {
			this.syncWithServer();
		}
	}
}

export const stars = new StarsStore();

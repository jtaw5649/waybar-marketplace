import { browser } from '$app/environment';
import { normalizeStarsPayload } from '$lib/utils/starsResponse';
import { encodeModuleUuid } from '$lib/utils/url';
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

const SYNC_INTERVAL_MS = 30000;

interface CachedStarModule {
	uuid: string;
	name: string;
	author_username: string;
	icon_url?: string;
}

class StarsStore {
	starred = new SvelteSet<string>(getStoredStars());
	starCounts = new SvelteMap<string, number>();
	isAuthenticated = $state(false);
	syncing = $state(false);
	private lastSyncTime = 0;
	private pendingSync: Promise<void> | null = null;
	private pendingUploads = new Set<string>();
	private cachedModules: CachedStarModule[] = [];

	starredUuids = $derived([...this.starred]);

	constructor() {}

	getCachedModules(): CachedStarModule[] {
		return this.cachedModules;
	}

	isStarred(uuid: string) {
		return this.starred.has(uuid);
	}

	getStarCount(uuid: string) {
		return this.starCounts.get(uuid) ?? 0;
	}

	async syncWithServer() {
		const now = Date.now();
		if (now - this.lastSyncTime < SYNC_INTERVAL_MS) {
			return;
		}

		if (this.pendingSync) {
			return this.pendingSync;
		}

		this.syncing = true;
		this.lastSyncTime = now;

		this.pendingSync = this.doSync();
		try {
			await this.pendingSync;
		} finally {
			this.pendingSync = null;
		}
	}

	private async doSync() {
		try {
			const res = await fetch('/api/stars');
			if (res.ok) {
				const data = await res.json();
				const payload = normalizeStarsPayload<CachedStarModule>(data);
				const serverStars = new Set<string>(payload.modules.map((m) => m.uuid));

				this.cachedModules = payload.modules;

				const merged = new Set([...this.starred, ...serverStars]);

				this.starred.clear();
				for (const s of merged) this.starred.add(s);

				persistStars(this.starred);
				this.isAuthenticated = true;

				const localOnly = [...merged].filter(
					(uuid) => !serverStars.has(uuid) && !this.pendingUploads.has(uuid)
				);

				const uploads = localOnly.map(async (uuid) => {
					this.pendingUploads.add(uuid);
					try {
						const uploadRes = await fetch(`/api/modules/${encodeModuleUuid(uuid)}/star`, {
							method: 'POST'
						});
						if (uploadRes.status === 404) {
							this.starred.delete(uuid);
							persistStars(this.starred);
						}
					} finally {
						this.pendingUploads.delete(uuid);
					}
				});

				await Promise.allSettled(uploads);
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
				const res = await fetch(`/api/modules/${encodeModuleUuid(uuid)}/star`, {
					method: wasStarred ? 'DELETE' : 'POST'
				});

				if (!res.ok) {
					if (wasStarred) this.starred.add(uuid);
					else this.starred.delete(uuid);

					persistStars(this.starred);
					return wasStarred;
				}

				const payload = (await res.json().catch(() => null)) as { success?: boolean } | null;
				if (payload && payload.success === false) {
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
		const wasAuthenticated = this.isAuthenticated;
		this.isAuthenticated = value;
		if (value && !wasAuthenticated && browser) {
			this.syncWithServer();
		}
	}
}

export const stars = new StarsStore();

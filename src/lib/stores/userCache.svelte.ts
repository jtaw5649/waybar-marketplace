import { SvelteMap } from 'svelte/reactivity';

export interface CachedUser {
	username: string;
	display_name?: string;
	avatar_url?: string;
	bio?: string;
	verified_author: boolean;
	module_count: number;
}

interface CacheEntry {
	user: CachedUser;
	timestamp: number;
}

const TTL_MS = 5 * 60 * 1000;
const cache = new SvelteMap<string, CacheEntry>();

export const userCache = {
	get(username: string): CachedUser | null {
		const entry = cache.get(username);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > TTL_MS) {
			cache.delete(username);
			return null;
		}

		return entry.user;
	},
	set(username: string, user: CachedUser): void {
		cache.set(username, { user, timestamp: Date.now() });
	},
	has(username: string): boolean {
		return this.get(username) !== null;
	},
	clear(): void {
		cache.clear();
	}
};

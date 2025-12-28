import { browser } from '$app/environment';
import { signOut } from '@auth/sveltekit/client';
import { notificationStore } from '$lib/stores/notifications.svelte';
import { pinnedModules } from '$lib/stores/pinnedModules';
import { recentlyViewed } from '$lib/stores/recentlyViewed';
import { searchPreferences } from '$lib/stores/searchPreferences';
import { stars } from '$lib/stores/stars.svelte';
import { userCache } from '$lib/stores/userCache.svelte';

const LOCAL_STORAGE_KEYS = [
	'barforge:notification-preferences',
	'starred_modules',
	'pinned_modules',
	'recently_viewed_modules',
	'browse_preferences'
];

export function clearUserLocalState() {
	stars.clearLocalState();
	pinnedModules.clear();
	recentlyViewed.clear();
	searchPreferences.reset();
	notificationStore.reset();
	userCache.clear();

	if (browser) {
		for (const key of LOCAL_STORAGE_KEYS) {
			localStorage.removeItem(key);
		}
	}
}

export async function signOutWithCleanup(options?: Parameters<typeof signOut>[0]) {
	clearUserLocalState();
	await signOut(options);
}

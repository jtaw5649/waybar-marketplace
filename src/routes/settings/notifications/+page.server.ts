import type { PageServerLoad } from './$types';
import {
	extractNotificationPreferencesApi,
	toNotificationPreferences
} from '$lib/utils/notificationPreferences';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	const session = await locals.auth();
	if (!session?.user) {
		return { preferences: null };
	}

	const response = await fetch('/api/notifications/preferences');
	if (!response.ok) {
		return { preferences: null };
	}

	const data = await response.json();
	const apiPreferences = extractNotificationPreferencesApi(data);
	if (!apiPreferences) {
		return { preferences: null };
	}

	return { preferences: toNotificationPreferences(apiPreferences) };
};

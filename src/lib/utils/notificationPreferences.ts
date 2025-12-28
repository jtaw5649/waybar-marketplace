import type { components } from '$lib/api-types';
import type { NotificationPreference, NotificationType } from '$lib/types';

export type NotificationPreferencesApi = components['schemas']['NotificationPreferences'];

const preferenceKeyMap: Record<
	NotificationType,
	{ inApp: keyof NotificationPreferencesApi; email: keyof NotificationPreferencesApi }
> = {
	downloads: { inApp: 'downloads_enabled', email: 'email_downloads' },
	comments: { inApp: 'comments_enabled', email: 'email_comments' },
	stars: { inApp: 'stars_enabled', email: 'email_stars' },
	updates: { inApp: 'updates_enabled', email: 'email_updates' },
	announcements: { inApp: 'announcements_enabled', email: 'email_announcements' }
};

const preferenceKeys = Object.values(preferenceKeyMap).flatMap(({ inApp, email }) => [
	inApp,
	email
]) as Array<keyof NotificationPreferencesApi>;

function isNotificationPreferencesApi(
	value: Record<string, unknown>
): value is NotificationPreferencesApi {
	return preferenceKeys.every((key) => typeof value[key] === 'boolean');
}

export function extractNotificationPreferencesApi(
	payload: unknown
): NotificationPreferencesApi | null {
	if (!payload || typeof payload !== 'object') {
		return null;
	}

	const root = payload as Record<string, unknown>;
	const data =
		root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null;
	const candidate = (data ?? root) as Record<string, unknown>;

	if (!isNotificationPreferencesApi(candidate)) {
		return null;
	}

	return candidate;
}

export function toNotificationPreferences(
	apiPreferences: NotificationPreferencesApi
): NotificationPreference[] {
	return (Object.keys(preferenceKeyMap) as NotificationType[]).map((type) => {
		const keys = preferenceKeyMap[type];
		return {
			type,
			inApp: Boolean(apiPreferences[keys.inApp]),
			email: Boolean(apiPreferences[keys.email])
		};
	});
}

export function toNotificationPreferencesApi(
	preferences: NotificationPreference[]
): NotificationPreferencesApi {
	const defaults: NotificationPreferencesApi = {
		downloads_enabled: false,
		comments_enabled: false,
		stars_enabled: false,
		updates_enabled: false,
		announcements_enabled: false,
		email_downloads: false,
		email_comments: false,
		email_stars: false,
		email_updates: false,
		email_announcements: false
	};

	return preferences.reduce((acc, preference) => {
		const keys = preferenceKeyMap[preference.type];
		return {
			...acc,
			[keys.inApp]: preference.inApp,
			[keys.email]: preference.email
		};
	}, defaults);
}

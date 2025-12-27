import { describe, expect, it } from 'vitest';
import type { NotificationPreference } from '$lib/types';
import {
	extractNotificationPreferencesApi,
	toNotificationPreferences,
	toNotificationPreferencesApi
} from './notificationPreferences';

const apiPreferences = {
	downloads_enabled: true,
	comments_enabled: false,
	stars_enabled: true,
	updates_enabled: false,
	announcements_enabled: true,
	email_downloads: false,
	email_comments: true,
	email_stars: false,
	email_updates: false,
	email_announcements: true
};

const uiPreferences: NotificationPreference[] = [
	{ type: 'downloads', email: false, inApp: true },
	{ type: 'comments', email: true, inApp: false },
	{ type: 'stars', email: false, inApp: true },
	{ type: 'updates', email: false, inApp: false },
	{ type: 'announcements', email: true, inApp: true }
];

describe('notification preferences mapping', () => {
	it('extracts preferences from root payload', () => {
		expect(extractNotificationPreferencesApi(apiPreferences)).toEqual(apiPreferences);
	});

	it('extracts preferences from nested data payload', () => {
		expect(extractNotificationPreferencesApi({ data: apiPreferences })).toEqual(apiPreferences);
	});

	it('returns null when preferences are missing', () => {
		expect(extractNotificationPreferencesApi(null)).toBeNull();
	});

	it('returns null when preferences have invalid types', () => {
		expect(
			extractNotificationPreferencesApi({
				...apiPreferences,
				email_updates: 'nope'
			})
		).toBeNull();
	});

	it('maps API preferences to UI preferences', () => {
		expect(toNotificationPreferences(apiPreferences)).toEqual(uiPreferences);
	});

	it('maps UI preferences to API preferences', () => {
		expect(toNotificationPreferencesApi(uiPreferences)).toEqual(apiPreferences);
	});
});

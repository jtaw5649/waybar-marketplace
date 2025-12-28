import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notificationStore } from './notifications.svelte';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '$lib/types';

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		clear: () => {
			store = {};
		}
	};
})();

describe('NotificationStore', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', localStorageMock);
		notificationStore.reset();
		localStorageMock.clear();
	});

	it('starts with empty notifications list', () => {
		expect(notificationStore.notifications).toEqual([]);
	});

	it('has zero unread count when empty', () => {
		expect(notificationStore.unreadCount).toBe(0);
	});

	it('counts unread notifications correctly', () => {
		notificationStore.addLocalNotification({
			type: 'announcements',
			title: 'Test',
			message: 'Test message',
			status: 'unread'
		});
		expect(notificationStore.unreadCount).toBe(1);
	});

	it('marks notification as read', () => {
		const id = notificationStore.addLocalNotification({
			type: 'comments',
			title: 'New comment',
			message: 'Someone commented'
		});
		expect(notificationStore.unreadCount).toBe(1);

		notificationStore.markRead(id);
		expect(notificationStore.unreadCount).toBe(0);
		expect(notificationStore.notifications[0].status).toBe('read');
	});

	it('marks all notifications as read', () => {
		notificationStore.addLocalNotification({ type: 'stars', title: 'Star 1', message: 'msg' });
		notificationStore.addLocalNotification({
			type: 'comments',
			title: 'Comment 1',
			message: 'msg'
		});
		notificationStore.addLocalNotification({ type: 'updates', title: 'Update 1', message: 'msg' });
		expect(notificationStore.unreadCount).toBe(3);

		notificationStore.markAllRead();
		expect(notificationStore.unreadCount).toBe(0);
	});

	it('marks all notifications as read and persists to the server', async () => {
		notificationStore.addLocalNotification({ type: 'stars', title: 'Star 1', message: 'msg' });
		notificationStore.addLocalNotification({ type: 'updates', title: 'Update 1', message: 'msg' });
		expect(notificationStore.unreadCount).toBe(2);

		const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
		vi.stubGlobal('fetch', fetchMock);

		await notificationStore.markAllReadWithSync();

		expect(notificationStore.unreadCount).toBe(0);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/notifications/mark-all-read',
			expect.objectContaining({ method: 'POST' })
		);

		vi.unstubAllGlobals();
	});

	it('marks notification as done (archived)', () => {
		const id = notificationStore.addLocalNotification({
			type: 'downloads',
			title: 'Milestone',
			message: '100 downloads'
		});
		notificationStore.markDone(id);
		expect(notificationStore.notifications[0].status).toBe('done');
	});

	it('loads default preferences with only announcements email enabled', () => {
		const prefs = notificationStore.getPreferences();
		const announcementsPref = prefs.find((p) => p.type === 'announcements');
		expect(announcementsPref?.email).toBe(true);

		const otherPrefs = prefs.filter((p) => p.type !== 'announcements');
		expect(otherPrefs.every((p) => p.email === false)).toBe(true);
	});

	it('saves and loads preferences to localStorage', () => {
		const newPrefs = [
			{ type: 'downloads' as const, email: true, inApp: true },
			{ type: 'comments' as const, email: true, inApp: false },
			{ type: 'stars' as const, email: false, inApp: true },
			{ type: 'updates' as const, email: false, inApp: true },
			{ type: 'announcements' as const, email: true, inApp: true }
		];
		notificationStore.savePreferences(newPrefs);

		const loaded = notificationStore.getPreferences();
		expect(loaded).toEqual(newPrefs);
	});

	it('falls back to defaults when stored preferences are invalid', () => {
		localStorageMock.setItem('barforge:notification-preferences', '{invalid');

		const loaded = notificationStore.getPreferences();

		expect(loaded).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
	});

	it('falls back to defaults when stored preferences have invalid items', () => {
		localStorageMock.setItem(
			'barforge:notification-preferences',
			JSON.stringify([{ type: 'downloads', email: 'yes', inApp: true }])
		);

		const loaded = notificationStore.getPreferences();

		expect(loaded).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
	});

	it('has syncing state that starts false', () => {
		expect(notificationStore.syncing).toBe(false);
	});

	it('syncWithServer sets syncing to true during fetch', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: { notifications: [] } })
		});
		vi.stubGlobal('fetch', fetchMock);

		const syncPromise = notificationStore.syncWithServer();
		expect(notificationStore.syncing).toBe(true);

		await syncPromise;
		expect(notificationStore.syncing).toBe(false);

		vi.unstubAllGlobals();
	});

	it('maps API notifications into UI model', async () => {
		const createdAt = '2024-01-01T00:00:00.000Z';
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					notifications: [
						{
							id: 42,
							notification_type: 'stars',
							title: 'New star',
							body: 'Someone starred your module',
							action_url: 'https://example.com',
							is_read: false,
							created_at: createdAt
						}
					],
					total: 1,
					version: 1
				})
		});
		vi.stubGlobal('fetch', fetchMock);

		await notificationStore.syncWithServer();

		expect(notificationStore.notifications).toEqual([
			{
				id: '42',
				type: 'stars',
				title: 'New star',
				message: 'Someone starred your module',
				link: 'https://example.com',
				status: 'unread',
				createdAt
			}
		]);

		vi.unstubAllGlobals();
	});

	it('drops invalid API notifications during sync', async () => {
		const createdAt = '2024-01-01T00:00:00.000Z';
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					notifications: [
						{
							id: 42,
							notification_type: 'stars',
							title: 'New star',
							body: 'Someone starred your module',
							action_url: 'https://example.com',
							is_read: false,
							created_at: createdAt
						},
						{
							id: 'bad',
							notification_type: 'stars'
						}
					]
				})
		});
		vi.stubGlobal('fetch', fetchMock);

		await notificationStore.syncWithServer();

		expect(notificationStore.notifications).toEqual([
			{
				id: '42',
				type: 'stars',
				title: 'New star',
				message: 'Someone starred your module',
				link: 'https://example.com',
				status: 'unread',
				createdAt
			}
		]);

		vi.unstubAllGlobals();
	});

	it('markReadWithSync marks locally and calls API', async () => {
		const id = notificationStore.addLocalNotification({
			type: 'stars',
			title: 'New Star',
			message: 'msg'
		});
		const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
		vi.stubGlobal('fetch', fetchMock);

		await notificationStore.markReadWithSync(id);

		expect(notificationStore.notifications[0].status).toBe('read');
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining(`/api/notifications/${id}/read`),
			expect.objectContaining({ method: 'PATCH' })
		);

		vi.unstubAllGlobals();
	});

	it('ingests API notifications into the store', () => {
		notificationStore.ingestApiNotification({
			id: 99,
			notification_type: 'comments',
			title: 'New comment',
			body: 'Nice work!',
			action_url: '/modules/test',
			is_read: false,
			created_at: '2024-02-01T00:00:00Z'
		});

		expect(notificationStore.notifications[0]).toMatchObject({
			id: '99',
			type: 'comments',
			title: 'New comment',
			message: 'Nice work!',
			link: '/modules/test',
			status: 'unread',
			createdAt: '2024-02-01T00:00:00Z'
		});
	});
});

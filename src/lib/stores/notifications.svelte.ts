import type {
	Notification,
	NotificationType,
	NotificationStatus,
	NotificationPreference
} from '$lib/types';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '$lib/types';

type ApiNotification = {
	id: number;
	notification_type: NotificationType;
	title: string;
	body?: string | null;
	action_url?: string | null;
	is_read: boolean;
	created_at: string;
};

interface LocalNotificationInput {
	type: NotificationType;
	title: string;
	message: string;
	status?: NotificationStatus;
	link?: string;
}

const notificationTypes = new Set<NotificationType>(
	DEFAULT_NOTIFICATION_PREFERENCES.map((preference) => preference.type)
);

function isNotificationPreference(value: unknown): value is NotificationPreference {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	if (typeof record.type !== 'string' || !notificationTypes.has(record.type as NotificationType)) {
		return false;
	}
	return typeof record.email === 'boolean' && typeof record.inApp === 'boolean';
}

function isApiNotification(value: unknown): value is ApiNotification {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	if (typeof record.id !== 'number') return false;
	if (
		typeof record.notification_type !== 'string' ||
		!notificationTypes.has(record.notification_type as NotificationType)
	) {
		return false;
	}
	if (typeof record.title !== 'string') return false;
	if (record.body !== undefined && record.body !== null && typeof record.body !== 'string') {
		return false;
	}
	if (
		record.action_url !== undefined &&
		record.action_url !== null &&
		typeof record.action_url !== 'string'
	) {
		return false;
	}
	if (typeof record.is_read !== 'boolean') return false;
	if (typeof record.created_at !== 'string') return false;
	return true;
}

function normalizeNotificationsPayload(payload: unknown): { notifications: ApiNotification[] } {
	if (!payload || typeof payload !== 'object') {
		return { notifications: [] };
	}

	const root = payload as Record<string, unknown>;
	const data =
		root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null;
	const notifications = (data?.notifications ?? root.notifications) as unknown;

	return {
		notifications: Array.isArray(notifications) ? notifications.filter(isApiNotification) : []
	};
}

function mapNotification(notification: ApiNotification): Notification {
	return {
		id: String(notification.id),
		type: notification.notification_type,
		title: notification.title,
		message: notification.body ?? '',
		link: notification.action_url ?? undefined,
		status: notification.is_read ? 'read' : 'unread',
		createdAt: notification.created_at
	};
}

class NotificationStore {
	notifications = $state<Notification[]>([]);
	syncing = $state(false);

	get unreadCount() {
		return this.notifications.filter((n) => n.status === 'unread').length;
	}

	addLocalNotification(input: LocalNotificationInput) {
		const notification: Notification = {
			id: crypto.randomUUID(),
			type: input.type,
			title: input.title,
			message: input.message,
			status: input.status ?? 'unread',
			createdAt: new Date().toISOString(),
			link: input.link
		};
		this.notifications = [notification, ...this.notifications];
		return notification.id;
	}

	markRead(id: string) {
		this.notifications = this.notifications.map((n) =>
			n.id === id ? { ...n, status: 'read' as const, readAt: new Date().toISOString() } : n
		);
	}

	markAllRead() {
		const now = new Date().toISOString();
		this.notifications = this.notifications.map((n) =>
			n.status === 'unread' ? { ...n, status: 'read' as const, readAt: now } : n
		);
	}

	async markAllReadWithSync() {
		this.markAllRead();
		await fetch('/api/notifications/mark-all-read', { method: 'POST' });
	}

	ingestApiNotification(notification: ApiNotification) {
		const mapped = mapNotification(notification);
		if (this.notifications.some((n) => n.id === mapped.id)) {
			return;
		}
		this.notifications = [mapped, ...this.notifications];
	}

	markDone(id: string) {
		this.notifications = this.notifications.map((n) =>
			n.id === id ? { ...n, status: 'done' as const } : n
		);
	}

	getPreferences(): NotificationPreference[] {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('barforge:notification-preferences');
			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					if (Array.isArray(parsed) && parsed.every(isNotificationPreference)) {
						return parsed;
					}
				} catch (error) {
					void error;
				}
			}
		}
		return [...DEFAULT_NOTIFICATION_PREFERENCES];
	}

	savePreferences(prefs: NotificationPreference[]) {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('barforge:notification-preferences', JSON.stringify(prefs));
		}
	}

	reset() {
		this.notifications = [];
	}

	async syncWithServer() {
		this.syncing = true;
		try {
			const res = await fetch('/api/notifications');
			if (res.ok) {
				const payload = normalizeNotificationsPayload(await res.json());
				this.notifications = payload.notifications.map(mapNotification);
			}
		} finally {
			this.syncing = false;
		}
	}

	async markReadWithSync(id: string) {
		this.markRead(id);
		await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
	}
}

export const notificationStore = new NotificationStore();

import { notificationStore } from './notifications.svelte';

class NotificationSSE {
	connected = $state(false);
	lastError = $state<string | null>(null);
	private source: EventSource | null = null;

	connect() {
		if (typeof EventSource === 'undefined') return;
		if (this.source) return;
		this.lastError = null;
		this.source = new EventSource('/api/notifications/stream');
		this.connected = true;

		this.source.addEventListener('open', () => {
			this.connected = true;
			this.lastError = null;
		});

		this.source.addEventListener('notification', (event) => {
			if (typeof event.data !== 'string') return;
			try {
				const payload = JSON.parse(event.data);
				this.lastError = null;
				notificationStore.ingestApiNotification(payload);
			} catch {
				this.lastError = 'Invalid notification payload';
			}
		});

		this.source.addEventListener('error', () => {
			this.connected = false;
			this.lastError = 'Connection lost';
		});
	}

	disconnect() {
		this.source?.close();
		this.source = null;
		this.connected = false;
		this.lastError = null;
	}
}

export const notificationSSE = new NotificationSSE();

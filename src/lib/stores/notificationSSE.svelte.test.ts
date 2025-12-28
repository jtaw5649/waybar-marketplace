import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationSSE } from './notificationSSE.svelte';
import { notificationStore } from './notifications.svelte';

class FakeEventSource {
	static lastInstance: FakeEventSource | null = null;
	listeners = new Map<string, (event: MessageEvent) => void>();
	close = vi.fn();

	constructor(public url: string) {
		FakeEventSource.lastInstance = this;
	}

	addEventListener(type: string, listener: (event: MessageEvent) => void) {
		this.listeners.set(type, listener);
	}
}

describe('notificationSSE store', () => {
	beforeEach(() => {
		FakeEventSource.lastInstance = null;
		vi.stubGlobal('EventSource', FakeEventSource as unknown as typeof EventSource);
		notificationSSE.disconnect();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('exists and exports connect function', () => {
		expect(typeof notificationSSE.connect).toBe('function');
	});

	it('exists and exports disconnect function', () => {
		expect(typeof notificationSSE.disconnect).toBe('function');
	});

	it('starts with connected = false', () => {
		expect(notificationSSE.connected).toBe(false);
	});

	it('connects to the SSE endpoint and marks connected', () => {
		notificationSSE.connect();
		expect(FakeEventSource.lastInstance?.url).toBe('/api/notifications/stream');
		expect(notificationSSE.connected).toBe(true);
	});

	it('sets connected to false when disconnecting', () => {
		notificationSSE.connect();
		notificationSSE.disconnect();
		expect(notificationSSE.connected).toBe(false);
	});

	it('closes the EventSource on disconnect', () => {
		notificationSSE.connect();
		const source = FakeEventSource.lastInstance;
		notificationSSE.disconnect();
		expect(source?.close).toHaveBeenCalled();
	});

	it('ingests notification events into the store', () => {
		const ingestSpy = vi.spyOn(notificationStore, 'ingestApiNotification');
		notificationSSE.connect();

		const handler = FakeEventSource.lastInstance?.listeners.get('notification');
		handler?.({
			data: JSON.stringify({
				id: 7,
				notification_type: 'stars',
				title: 'New star',
				body: 'Nice work',
				action_url: '/modules/test',
				is_read: false,
				created_at: '2024-03-01T00:00:00Z'
			})
		} as MessageEvent);

		expect(ingestSpy).toHaveBeenCalledWith(
			expect.objectContaining({ id: 7, notification_type: 'stars' })
		);
	});

	it('tracks parse errors for invalid payloads', () => {
		const ingestSpy = vi.spyOn(notificationStore, 'ingestApiNotification');
		notificationSSE.connect();

		const handler = FakeEventSource.lastInstance?.listeners.get('notification');
		handler?.({ data: '{bad-json' } as MessageEvent);

		expect(ingestSpy).not.toHaveBeenCalled();
		expect(notificationSSE.lastError).toBe('Invalid notification payload');
	});

	it('tracks connection errors and recovers on open', () => {
		notificationSSE.connect();

		const errorHandler = FakeEventSource.lastInstance?.listeners.get('error');
		errorHandler?.({} as MessageEvent);

		expect(notificationSSE.connected).toBe(false);
		expect(notificationSSE.lastError).toBe('Connection lost');

		const openHandler = FakeEventSource.lastInstance?.listeners.get('open');
		openHandler?.({} as MessageEvent);

		expect(notificationSSE.connected).toBe(true);
		expect(notificationSSE.lastError).toBeNull();
	});

	it('noops when EventSource is unavailable', () => {
		vi.unstubAllGlobals();
		delete (globalThis as { EventSource?: typeof EventSource }).EventSource;

		notificationSSE.disconnect();
		expect(() => notificationSSE.connect()).not.toThrow();
		expect(notificationSSE.connected).toBe(false);
	});
});

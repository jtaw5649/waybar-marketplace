// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

const mockNotificationStore = vi.hoisted(() => ({
	notifications: [] as {
		id: string;
		type: string;
		title: string;
		message: string;
		status: string;
		createdAt: string;
		link?: string;
	}[],
	unreadCount: 0,
	markRead: vi.fn(),
	markReadWithSync: vi.fn(),
	markAllRead: vi.fn(),
	markAllReadWithSync: vi.fn(),
	markDone: vi.fn(),
	syncWithServer: vi.fn(),
	reset: vi.fn()
}));

vi.mock('$lib/stores/notifications.svelte', () => ({
	notificationStore: mockNotificationStore
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

import { goto } from '$app/navigation';
import NotificationCenter from './NotificationCenter.svelte';

describe('NotificationCenter', () => {
	beforeEach(() => {
		mockNotificationStore.notifications = [];
		mockNotificationStore.unreadCount = 0;
		vi.clearAllMocks();
	});

	it('renders bell button with accessibility label', () => {
		render(NotificationCenter);

		expect(screen.getByRole('button', { name: /notifications/i })).toBeTruthy();
	});

	it('shows no badge when unread count is zero', () => {
		render(NotificationCenter);

		const badge = document.querySelector('.badge');
		expect(badge).toBeNull();
	});

	it('shows badge with unread count', () => {
		mockNotificationStore.unreadCount = 5;
		render(NotificationCenter);

		const badge = document.querySelector('.badge');
		expect(badge?.textContent).toBe('5');
	});

	it('opens dropdown when clicked', async () => {
		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		await fireEvent.click(button);

		const dropdown = document.querySelector('.dropdown');
		expect(dropdown).toBeTruthy();
	});

	it('syncs notifications when opening dropdown', async () => {
		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		await fireEvent.click(button);

		expect(mockNotificationStore.syncWithServer).toHaveBeenCalled();
	});

	it('shows empty state when no notifications', async () => {
		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		await fireEvent.click(button);

		expect(screen.getByText('No notifications')).toBeTruthy();
	});

	it('closes dropdown when clicking outside', async () => {
		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		await fireEvent.click(button);

		expect(document.querySelector('.dropdown')).toBeTruthy();

		await fireEvent.click(document.body);

		expect(document.querySelector('.dropdown')).toBeNull();
	});

	it('highlights button when dropdown is open', async () => {
		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		expect(button.classList.contains('active')).toBe(false);

		await fireEvent.click(button);

		expect(button.classList.contains('active')).toBe(true);
	});

	it('marks all notifications read when clicking the action', async () => {
		mockNotificationStore.unreadCount = 2;
		mockNotificationStore.notifications = [
			{
				id: '1',
				type: 'comments',
				title: 'New comment',
				message: 'Message',
				status: 'unread',
				createdAt: new Date().toISOString(),
				link: '/modules/test'
			}
		];

		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		await fireEvent.click(button);

		const markAll = screen.getByRole('button', { name: /mark all as read/i });
		await fireEvent.click(markAll);

		expect(mockNotificationStore.markAllReadWithSync).toHaveBeenCalled();
	});

	it('marks notifications read and navigates when clicked', async () => {
		mockNotificationStore.unreadCount = 1;
		mockNotificationStore.notifications = [
			{
				id: '99',
				type: 'comments',
				title: 'New comment',
				message: 'Message',
				status: 'unread',
				createdAt: new Date().toISOString(),
				link: '/modules/test'
			}
		];

		render(NotificationCenter);

		const button = screen.getByRole('button', { name: /notifications/i });
		await fireEvent.click(button);

		const notification = screen.getByRole('button', { name: /new comment/i });
		await fireEvent.click(notification);

		expect(mockNotificationStore.markReadWithSync).toHaveBeenCalledWith('99');
		expect(vi.mocked(goto)).toHaveBeenCalledWith('/modules/test');
	});
});

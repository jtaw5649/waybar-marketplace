// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import type { NotificationPreference } from '$lib/types';

const mockNotificationStore = vi.hoisted(() => ({
	getPreferences: vi.fn(),
	savePreferences: vi.fn()
}));

vi.mock('$lib/stores/notifications.svelte', () => ({
	notificationStore: mockNotificationStore
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	toast: { success: vi.fn(), error: vi.fn() }
}));

const serverPreferences: NotificationPreference[] = [
	{ type: 'downloads', email: true, inApp: true },
	{ type: 'comments', email: false, inApp: false },
	{ type: 'stars', email: false, inApp: true },
	{ type: 'updates', email: true, inApp: false },
	{ type: 'announcements', email: true, inApp: true }
];

const baseData = {
	session: {
		user: {
			login: 'testuser',
			name: 'Test User',
			image: 'https://example.com/avatar.jpg'
		},
		expires: '2099-12-31T23:59:59.999Z'
	},
	isAdmin: false,
	userProfile: null,
	profile: null,
	modules: []
};

describe('Notification settings page', () => {
	beforeEach(() => {
		mockNotificationStore.getPreferences.mockReturnValue([
			{ type: 'downloads', email: false, inApp: false },
			{ type: 'comments', email: false, inApp: false },
			{ type: 'stars', email: false, inApp: false },
			{ type: 'updates', email: false, inApp: false },
			{ type: 'announcements', email: false, inApp: false }
		]);
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	it('uses server preferences when provided', async () => {
		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: { ...baseData, preferences: serverPreferences } });
		await tick();

		const emailToggle = screen.getByLabelText(/email notifications for download milestones/i);
		expect((emailToggle as HTMLInputElement).checked).toBe(true);
	});

	it('sends preferences to the API when saving', async () => {
		vi.useFakeTimers();
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));

		const { default: Page } = await import('./+page.svelte');
		render(Page, { data: { ...baseData, preferences: serverPreferences } });
		await tick();

		const saveButton = screen.getByRole('button', { name: /save preferences/i });
		await fireEvent.click(saveButton);

		await vi.runAllTimersAsync();

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/notifications/preferences',
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({
					'Content-Type': 'application/json'
				})
			})
		);
		expect(mockNotificationStore.savePreferences).toHaveBeenCalledWith(serverPreferences);
	});
});

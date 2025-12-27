import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load } from './+page.server';

type LoadEvent = Parameters<typeof load>[0];

const makeEvent = (
	session: Record<string, unknown> | null = { user: { name: 'test' } }
): LoadEvent =>
	({
		locals: { auth: vi.fn().mockResolvedValue(session) },
		fetch: vi.fn()
	}) as unknown as LoadEvent;

describe('notifications settings page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('returns null preferences when not authenticated', async () => {
		const event = makeEvent(null);
		const result = (await load(event)) as { preferences: unknown };
		expect(result.preferences).toBeNull();
	});

	it('fetches preferences from API when authenticated', async () => {
		const mockPrefs = {
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
		const expectedPrefs = [
			{ type: 'downloads', email: false, inApp: true },
			{ type: 'comments', email: true, inApp: false },
			{ type: 'stars', email: false, inApp: true },
			{ type: 'updates', email: false, inApp: false },
			{ type: 'announcements', email: true, inApp: true }
		];
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: mockPrefs })
		});
		const event = makeEvent({ user: { name: 'test' } });
		event.fetch = mockFetch;

		const result = (await load(event)) as { preferences: unknown };

		expect(mockFetch).toHaveBeenCalledWith('/api/notifications/preferences');
		expect(result.preferences).toEqual(expectedPrefs);
	});
});

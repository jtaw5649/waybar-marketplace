import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, PATCH } from './+server';
import { resolveAccessToken } from '$lib/server/token';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn(),
	getServerToken: vi.fn()
}));

type PreferencesEvent = Parameters<typeof GET>[0];

const makeEvent = (
	session: Record<string, string> | null = { accessToken: 'token' }
): PreferencesEvent =>
	({
		cookies: {} as PreferencesEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue(session) }
	}) as unknown as PreferencesEvent;

describe('notification preferences api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('GET throws 401 when no access token', async () => {
		const event = makeEvent(null);
		vi.mocked(resolveAccessToken).mockResolvedValueOnce(null);

		await expect(GET(event)).rejects.toMatchObject({ status: 401 });
	});

	it('GET fetches preferences from backend', async () => {
		const event = makeEvent({ accessToken: 'token' });
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ data: { downloads_enabled: true } }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		await GET(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/notifications/preferences'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('GET throws when backend returns non-ok', async () => {
		const event = makeEvent({ accessToken: 'token' });
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 502 }));

		await expect(GET(event)).rejects.toMatchObject({ status: 502 });
	});

	it('PATCH throws 401 when no access token', async () => {
		const event = {
			...(makeEvent(null) as PreferencesEvent),
			request: new Request('http://localhost/api/notifications/preferences', {
				method: 'PATCH',
				body: JSON.stringify({ downloads_enabled: true })
			})
		};
		vi.mocked(resolveAccessToken).mockResolvedValueOnce(null);

		await expect(PATCH(event as Parameters<typeof PATCH>[0])).rejects.toMatchObject({
			status: 401
		});
	});

	it('PATCH forwards preferences to backend', async () => {
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
		const event = {
			...(makeEvent({ accessToken: 'token' }) as PreferencesEvent),
			request: new Request('http://localhost/api/notifications/preferences', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(apiPreferences)
			})
		};

		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ data: apiPreferences }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		await PATCH(event as Parameters<typeof PATCH>[0]);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/notifications/preferences'),
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: 'Bearer token'
				}),
				body: JSON.stringify(apiPreferences)
			})
		);
	});
});

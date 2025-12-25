import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './+server';
import { resolveAccessToken } from '$lib/server/token';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn(),
	getServerToken: vi.fn()
}));

type StarsEvent = Parameters<typeof GET>[0];

const makeEvent = (session: Record<string, string> | null = { accessToken: 'token' }): StarsEvent =>
	({
		cookies: {} as StarsEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue(session) }
	}) as unknown as StarsEvent;

describe('stars api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('refreshes session before fetching stars', async () => {
		const session = { accessToken: 'token' };
		const event = makeEvent(session);
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({ data: { modules: [], total: 0 } })
		} as unknown as Response);

		await GET(event);

		expect(event.locals.auth).toHaveBeenCalled();
		expect(resolveAccessToken).toHaveBeenCalledWith(event.cookies, session);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/users/me/stars'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('returns empty data when access token is missing', async () => {
		const event = makeEvent(null);
		vi.mocked(resolveAccessToken).mockResolvedValueOnce(null);

		const response = await GET(event);
		const payload = await response.json();

		expect(payload).toEqual({ data: { modules: [], total: 0 } });
		expect(fetch).not.toHaveBeenCalled();
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './+server';
import { resolveAccessToken } from '$lib/server/token';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn(),
	getServerToken: vi.fn()
}));

type NotificationsEvent = Parameters<typeof GET>[0];

const makeEvent = (
	session: Record<string, string> | null = { accessToken: 'token' }
): NotificationsEvent =>
	({
		cookies: {} as NotificationsEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue(session) },
		url: new URL('http://localhost/api/notifications')
	}) as unknown as NotificationsEvent;

describe('notifications api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('throws 401 when no access token', async () => {
		const event = makeEvent(null);
		vi.mocked(resolveAccessToken).mockResolvedValueOnce(null);

		await expect(GET(event)).rejects.toMatchObject({ status: 401 });
	});

	it('fetches notifications with auth header', async () => {
		const session = { accessToken: 'token' };
		const event = makeEvent(session);
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: vi.fn().mockResolvedValue({ data: { notifications: [], total: 0 } })
		} as unknown as Response);

		await GET(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/notifications'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});
});

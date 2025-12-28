import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './+server';
import { resolveAccessToken } from '$lib/server/token';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn(),
	getServerToken: vi.fn()
}));

type MarkAllEvent = Parameters<typeof POST>[0];

const makeEvent = (
	session: Record<string, string> | null = { accessToken: 'token' }
): MarkAllEvent =>
	({
		cookies: {} as MarkAllEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue(session) }
	}) as unknown as MarkAllEvent;

describe('mark all notifications read api', () => {
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

		await expect(POST(event)).rejects.toMatchObject({ status: 401 });
	});

	it('calls registry mark-all endpoint', async () => {
		const event = makeEvent();
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: { marked_count: 1 } })
		} as Response);

		await POST(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/notifications/mark-all-read'),
			expect.objectContaining({ method: 'POST' })
		);
	});
});

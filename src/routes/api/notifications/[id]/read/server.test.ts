import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PATCH } from './+server';
import { resolveAccessToken } from '$lib/server/token';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn(),
	getServerToken: vi.fn()
}));

type ReadEvent = Parameters<typeof PATCH>[0];

const makeEvent = (
	session: Record<string, string> | null = { accessToken: 'token' },
	id = '123'
): ReadEvent =>
	({
		cookies: {} as ReadEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue(session) },
		params: { id }
	}) as unknown as ReadEvent;

describe('mark notification read api', () => {
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

		await expect(PATCH(event)).rejects.toMatchObject({ status: 401 });
	});
});

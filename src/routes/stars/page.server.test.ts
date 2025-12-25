import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { load } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = {
	starredModules: unknown[];
	total: number;
	isAuthenticated: boolean;
	session: { user?: { login?: string }; error?: string } | null;
};

describe('stars page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('returns unauthenticated when session is missing', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue(null);
		const { load } = await import('./+page.server');
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue(null)
			}
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result).toEqual({
			starredModules: [],
			total: 0,
			isAuthenticated: false,
			session: null
		});
	});

	it('strips access token when refresh error occurs', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { load } = await import('./+page.server');
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' },
					accessToken: 'token',
					error: 'RefreshTokenError'
				})
			}
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.isAuthenticated).toBe(false);
		expect(result.session).toEqual({
			user: { login: 'test' },
			error: 'RefreshTokenError'
		});
	});

	it('returns sanitized session when authenticated', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { load } = await import('./+page.server');
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' }
				})
			},
			cookies: {}
		} as unknown as LoadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ data: { modules: [], total: 0 } })
		} as Response);

		const result = (await load(event)) as LoadResult;

		expect(result.isAuthenticated).toBe(true);
		expect(result.session).toEqual({ user: { login: 'test' } });
		expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/users/me/stars'), {
			headers: { Accept: 'application/json', Authorization: 'Bearer token' }
		});
	});
});

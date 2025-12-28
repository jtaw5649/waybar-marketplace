import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+layout.server';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn()
}));

vi.mock('$lib', () => ({
	API_BASE_URL: 'https://api.example.com'
}));

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = { session: { user?: { name?: string } } | null; isAdmin: boolean };

function mockCookies() {
	return {
		get: vi.fn().mockReturnValue(undefined),
		set: vi.fn(),
		delete: vi.fn()
	};
}

describe('root layout server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('removes accessToken from session data', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue(null);

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'Test' },
					accessToken: 'token',
					error: undefined
				})
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect('accessToken' in (result.session ?? {})).toBe(false);
		expect(result.session?.user?.name).toBe('Test');
	});

	it('returns null session when unauthenticated', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue(null);

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue(null)
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.session).toBeNull();
	});

	it('returns isAdmin false when unauthenticated', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue(null);

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue(null)
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.isAdmin).toBe(false);
	});

	it('returns isAdmin true for admin users', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('valid-token');

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ role: 'admin' }) });

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'Admin' }
				})
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.isAdmin).toBe(true);
		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/users/me'), {
			headers: { Accept: 'application/json', Authorization: 'Bearer valid-token' }
		});
	});

	it('returns isAdmin true for moderator users', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('valid-token');

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ role: 'moderator' }) });

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'Mod' }
				})
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.isAdmin).toBe(true);
		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/users/me'), {
			headers: { Accept: 'application/json', Authorization: 'Bearer valid-token' }
		});
	});

	it('returns isAdmin false for regular users', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('valid-token');

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ role: 'user' }) });

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'User' }
				})
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.isAdmin).toBe(false);
		expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/v1/users/me'), {
			headers: { Accept: 'application/json', Authorization: 'Bearer valid-token' }
		});
	});

	it('syncs auth before fetching profile when cache is missing', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('valid-token');

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ role: 'user' }) });

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'User' }
				})
			},
			cookies: mockCookies()
		} as unknown as LoadEvent;

		await load(event);

		expect(global.fetch).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('/api/v1/auth/sync'),
			expect.objectContaining({
				method: 'POST',
				headers: { Accept: 'application/json', Authorization: 'Bearer valid-token' }
			})
		);
		expect(global.fetch).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('/api/v1/users/me'),
			expect.objectContaining({
				headers: { Accept: 'application/json', Authorization: 'Bearer valid-token' }
			})
		);
	});

	it('does not set profile_cache cookie', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('valid-token');

		global.fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
			.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ role: 'user' }) });

		const cookies = mockCookies();
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'User' }
				})
			},
			cookies,
			url: new URL('https://example.com')
		} as unknown as LoadEvent;

		await load(event);

		expect(cookies.set).not.toHaveBeenCalled();
	});
});

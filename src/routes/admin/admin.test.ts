import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { load } from './+page.server';

type LoadEvent = Parameters<typeof load>[0];

interface RedirectError {
	status: number;
	location: string;
}

vi.mock('@sveltejs/kit', async () => {
	const actual = await vi.importActual('@sveltejs/kit');
	return {
		...actual,
		redirect: vi.fn((status: number, location: string) => {
			throw { status, location };
		})
	};
});

function createMockEvent(locals: { auth: ReturnType<typeof vi.fn> }): LoadEvent {
	return { locals } as unknown as LoadEvent;
}

function createAuthorizedEvent(role: 'admin' | 'moderator') {
	const mockSession = {
		user: { name: role },
		accessToken: 'valid-token'
	};

	const mockSubmissions = [{ id: 1, name: 'Test Module' }];
	const mockStats = { total_modules: 10, total_users: 5 };

	const event = {
		locals: {
			auth: vi.fn().mockResolvedValue(mockSession)
		},
		fetch: vi.fn((url) => {
			if (url.endsWith('/users/me')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ role })
				});
			}
			if (url.endsWith('/admin/submissions')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: mockSubmissions })
				});
			}
			if (url.endsWith('/admin/stats')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: mockStats })
				});
			}
			return Promise.reject(new Error('Unknown URL'));
		})
	} as unknown as LoadEvent;

	return { event, mockSession, mockSubmissions, mockStats };
}

describe('admin page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('unauthenticated user redirect', () => {
		it('redirects to /login with redirectTo=/admin parameter', async () => {
			const mockEvent = createMockEvent({
				auth: vi.fn().mockResolvedValue(null)
			});

			const { load } = await import('./+page.server');

			try {
				await load(mockEvent);
				expect.fail('Expected redirect to be thrown');
			} catch (e) {
				const error = e as RedirectError;
				expect(error.status).toBe(302);
				expect(error.location).toBe('/login?redirectTo=/admin');
			}
		});

		it('redirects to /login when session has RefreshTokenError', async () => {
			const mockEvent = createMockEvent({
				auth: vi.fn().mockResolvedValue({
					user: { name: 'Test' },
					accessToken: 'stale-token',
					error: 'RefreshTokenError'
				})
			});

			const { load } = await import('./+page.server');

			try {
				await load(mockEvent);
				expect.fail('Expected redirect to be thrown');
			} catch (e) {
				const error = e as RedirectError;
				expect(error.status).toBe(302);
				expect(error.location).toBe('/login?redirectTo=/admin');
			}
		});
	});

	describe('authenticated admin user', () => {
		it('returns session, submissions, and stats', async () => {
			const { event, mockSession, mockSubmissions, mockStats } = createAuthorizedEvent('admin');

			const { load } = await import('./+page.server');
			const result = await load(event);

			expect(result).toEqual({
				session: { user: mockSession.user },
				submissions: mockSubmissions,
				stats: mockStats
			});

			expect(event.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/submissions'), {
				headers: { Authorization: 'Bearer valid-token' }
			});
			expect(event.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/stats'), {
				headers: { Authorization: 'Bearer valid-token' }
			});
		});
	});

	describe('authenticated moderator user', () => {
		it('returns session, submissions, and stats', async () => {
			const { event, mockSession, mockSubmissions, mockStats } = createAuthorizedEvent('moderator');

			const { load } = await import('./+page.server');
			const result = await load(event);

			expect(result).toEqual({
				session: { user: mockSession.user },
				submissions: mockSubmissions,
				stats: mockStats
			});
		});
	});
});

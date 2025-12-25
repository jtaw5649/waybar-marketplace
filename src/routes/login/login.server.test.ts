import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { load } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

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

function createMockEvent(
	locals: { auth: ReturnType<typeof vi.fn> },
	url: URL = new URL('http://localhost/login'),
	withToken: boolean = false
): LoadEvent {
	vi.mocked(resolveAccessToken).mockResolvedValue(withToken ? 'valid-token' : null);
	return { locals, url, cookies: {} } as unknown as LoadEvent;
}

describe('login page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('authenticated user redirect', () => {
		it('redirects to redirectTo param when user is authenticated', async () => {
			const mockEvent = createMockEvent(
				{
					auth: vi.fn().mockResolvedValue({
						user: { name: 'Test' }
					})
				},
				new URL('http://localhost/login?redirectTo=/admin'),
				true
			);

			const { load } = await import('./+page.server');

			try {
				await load(mockEvent);
				expect.fail('Expected redirect to be thrown');
			} catch (e) {
				const error = e as RedirectError;
				expect(error.status).toBe(303);
				expect(error.location).toBe('/admin');
			}
		});

		it('redirects when session has access token even without cookie', async () => {
			vi.mocked(resolveAccessToken).mockResolvedValue('valid-token');
			const mockEvent = {
				locals: {
					auth: vi.fn().mockResolvedValue({
						user: { name: 'Test' }
					})
				},
				url: new URL('http://localhost/login?redirectTo=/admin'),
				cookies: {}
			} as unknown as LoadEvent;

			const { load } = await import('./+page.server');

			try {
				await load(mockEvent);
				expect.fail('Expected redirect to be thrown');
			} catch (e) {
				const error = e as RedirectError;
				expect(error.status).toBe(303);
				expect(error.location).toBe('/admin');
			}
		});

		it('redirects to / when redirectTo is external', async () => {
			const mockEvent = createMockEvent(
				{
					auth: vi.fn().mockResolvedValue({
						user: { name: 'Test' }
					})
				},
				new URL('http://localhost/login?redirectTo=https://example.com'),
				true
			);

			const { load } = await import('./+page.server');

			try {
				await load(mockEvent);
				expect.fail('Expected redirect to be thrown');
			} catch (e) {
				const error = e as RedirectError;
				expect(error.status).toBe(303);
				expect(error.location).toBe('/');
			}
		});

		it('redirects to / when no redirectTo param', async () => {
			const mockEvent = createMockEvent(
				{
					auth: vi.fn().mockResolvedValue({
						user: { name: 'Test' }
					})
				},
				new URL('http://localhost/login'),
				true
			);

			const { load } = await import('./+page.server');

			try {
				await load(mockEvent);
				expect.fail('Expected redirect to be thrown');
			} catch (e) {
				const error = e as RedirectError;
				expect(error.status).toBe(303);
				expect(error.location).toBe('/');
			}
		});
	});

	describe('unauthenticated or invalid session', () => {
		it('returns session for unauthenticated user', async () => {
			const mockEvent = createMockEvent({
				auth: vi.fn().mockResolvedValue(null)
			});

			const { load } = await import('./+page.server');
			const result = await load(mockEvent);

			expect(result).toEqual({ session: null });
		});

		it('returns session with RefreshTokenError for client handling', async () => {
			const sessionWithError = {
				user: { name: 'Test' },
				accessToken: 'stale-token',
				error: 'RefreshTokenError'
			};

			const mockEvent = createMockEvent({
				auth: vi.fn().mockResolvedValue(sessionWithError)
			});

			const { load } = await import('./+page.server');
			const result = await load(mockEvent);

			expect(result).toEqual({
				session: { user: sessionWithError.user, error: sessionWithError.error }
			});
		});
	});
});

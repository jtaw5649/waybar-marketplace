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

function createMockEvent(
	locals: { auth: ReturnType<typeof vi.fn> },
	url: URL = new URL('http://localhost/login')
): LoadEvent {
	return { locals, url } as unknown as LoadEvent;
}

describe('login page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
	});

	describe('authenticated user redirect', () => {
		it('redirects to redirectTo param when user is authenticated', async () => {
			const mockEvent = createMockEvent(
				{
					auth: vi.fn().mockResolvedValue({
						user: { name: 'Test' },
						accessToken: 'valid-token'
					})
				},
				new URL('http://localhost/login?redirectTo=/admin')
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

		it('redirects to / when no redirectTo param', async () => {
			const mockEvent = createMockEvent({
				auth: vi.fn().mockResolvedValue({
					user: { name: 'Test' },
					accessToken: 'valid-token'
				})
			});

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

			expect(result).toEqual({ session: sessionWithError });
		});
	});
});

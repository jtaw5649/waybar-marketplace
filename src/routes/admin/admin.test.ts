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
});

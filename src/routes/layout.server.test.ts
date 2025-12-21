import { describe, it, expect, vi } from 'vitest';
import { load } from './+layout.server';

type LoadEvent = Parameters<typeof load>[0];
type LoadResult = { session: { user?: { name?: string } } | null };

describe('root layout server', () => {
	it('removes accessToken from session data', async () => {
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { name: 'Test' },
					accessToken: 'token',
					error: undefined
				})
			}
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect('accessToken' in (result.session ?? {})).toBe(false);
		expect(result.session?.user?.name).toBe('Test');
	});

	it('returns null session when unauthenticated', async () => {
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue(null)
			}
		} as unknown as LoadEvent;

		const result = (await load(event)) as LoadResult;

		expect(result.session).toBeNull();
	});
});

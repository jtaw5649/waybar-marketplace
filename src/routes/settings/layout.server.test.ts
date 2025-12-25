import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load } from './+layout.server';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

type LoadEvent = Parameters<typeof load>[0];

describe('settings layout server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses Accept and Authorization headers for profile and modules', async () => {
		const event = {
			locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'test' } }) },
			cookies: {}
		} as unknown as LoadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock
			.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
			.mockResolvedValueOnce({ ok: true, json: async () => ({ modules: [] }) } as Response);

		await load(event);

		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('/api/v1/users/me'),
			expect.objectContaining({
				headers: { Accept: 'application/json', Authorization: 'Bearer token' }
			})
		);

		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('/api/v1/modules/mine'),
			expect.objectContaining({
				headers: { Accept: 'application/json', Authorization: 'Bearer token' }
			})
		);
	});
});

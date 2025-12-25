import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { actions } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

type UpdateProfileEvent = Parameters<typeof actions.updateProfile>[0];

describe('settings profile page server actions', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses JSON headers for updateProfile', async () => {
		const formData = new FormData();
		formData.set('display_name', 'Test');
		formData.set('bio', 'Bio');
		formData.set('website_url', 'https://example.com');
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({ user: { login: 'test' } })
			},
			cookies: {},
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as UpdateProfileEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await actions.updateProfile(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/users/me'),
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer token'
				})
			})
		);
	});
});

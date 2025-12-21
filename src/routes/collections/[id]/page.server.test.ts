import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load } from './+page.server';

type LoadEvent = Parameters<typeof load>[0];

describe('collections page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses Authorization header when access token is available', async () => {
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' },
					accessToken: 'token'
				})
			},
			params: { id: '1' },
			cookies: { get: vi.fn().mockReturnValue(null) }
		} as unknown as LoadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 1,
				name: 'Test',
				description: null,
				visibility: 'public',
				module_count: 0,
				modules: [],
				owner: {
					username: 'test',
					display_name: null,
					avatar_url: null
				},
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			})
		} as Response);

		await load(event);

		expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/collections/1'), {
			headers: { Authorization: 'Bearer token' }
		});
	});
});

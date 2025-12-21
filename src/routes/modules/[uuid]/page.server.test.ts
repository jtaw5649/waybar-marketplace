import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load, actions } from './+page.server';

type LoadEvent = Parameters<typeof load>[0];
type ActionEvent = Parameters<typeof actions.addToCollection>[0];

describe('module page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses Authorization header for collections fetch', async () => {
		const moduleData = {
			uuid: 'module@test',
			name: 'Test',
			description: 'Test',
			category: 'system',
			author: 'test',
			downloads: 0,
			verified_author: false
		};

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'Test' },
					accessToken: 'token'
				})
			},
			params: { uuid: 'module@test' },
			cookies: { get: vi.fn().mockReturnValue(null) },
			fetch: vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ data: moduleData })
			})
		} as unknown as LoadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ collections: [] })
		} as Response);

		await load(event);

		expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/collections'), {
			headers: { Authorization: 'Bearer token' }
		});
	});

	it('uses Authorization header for addToCollection', async () => {
		const formData = new FormData();
		formData.set('collection_id', '1');

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' },
					accessToken: 'token'
				})
			},
			params: { uuid: 'module@test' },
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as ActionEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true, text: async () => '' } as Response);

		await actions.addToCollection(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/collections/1/modules'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('returns unauthorized when access token is missing for addToCollection', async () => {
		const formData = new FormData();
		formData.set('collection_id', '1');

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({ user: { login: 'test' } })
			},
			params: { uuid: 'module@test' },
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as ActionEvent;

		const result = (await actions.addToCollection(event)) as { status: number };

		expect(result.status).toBe(401);
	});
});

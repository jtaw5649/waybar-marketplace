import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { actions, load } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

type LoadEvent = Parameters<typeof load>[0];
type ActionEvent = Parameters<typeof actions.addToCollection>[0];
type UploadEvent = Parameters<typeof actions.uploadScreenshot>[0];

describe('module page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses Authorization header for collections fetch', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { load } = await import('./+page.server');
		const moduleData = {
			uuid: 'module@test',
			name: 'Test',
			description: 'Test',
			category: 'system',
			author: 'test',
			downloads: 0,
			verified_author: false,
			repo_url: 'https://example.com/test',
			tags: []
		};

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'Test' }
				})
			},
			params: { uuid: 'module@test' },
			cookies: {},
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
			headers: { Accept: 'application/json', Authorization: 'Bearer token' }
		});
	});

	it('uses Authorization header for addToCollection', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { actions } = await import('./+page.server');
		const formData = new FormData();
		formData.set('collection_id', '1');

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' }
				})
			},
			params: { uuid: 'module@test' },
			cookies: {},
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as ActionEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true, text: async () => '' } as Response);

		await actions.addToCollection(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/collections/1/modules'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Accept: 'application/json',
					Authorization: 'Bearer token'
				})
			})
		);
	});

	it('returns unauthorized when access token is missing for addToCollection', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue(null);
		const { actions } = await import('./+page.server');
		const formData = new FormData();
		formData.set('collection_id', '1');

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({ user: { login: 'test' } })
			},
			params: { uuid: 'module@test' },
			cookies: {},
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as ActionEvent;

		const result = (await actions.addToCollection(event)) as { status: number };

		expect(result.status).toBe(401);
	});

	it('allows screenshot uploads up to 10mb', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { actions } = await import('./+page.server');
		const fileData = new Uint8Array(3 * 1024 * 1024);
		const file = {
			size: fileData.length,
			type: 'image/png',
			arrayBuffer: vi.fn().mockResolvedValue(fileData.buffer)
		} as unknown as File;

		const formData = new FormData();
		Object.defineProperty(formData, 'get', {
			value: (key: string) => (key === 'screenshot' ? file : null)
		});

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' }
				})
			},
			params: { uuid: 'module@test' },
			cookies: {},
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as UploadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true, text: async () => '' } as Response);

		const result = await actions.uploadScreenshot(event);

		expect(fetchMock).toHaveBeenCalled();
		expect(result).toEqual({ success: true });
	});

	it('uploads screenshot bytes with content-type and alt text query', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { actions } = await import('./+page.server');
		const fileData = new Uint8Array([1, 2, 3]);
		const file = {
			size: fileData.length,
			type: 'image/png',
			arrayBuffer: vi.fn().mockResolvedValue(fileData.buffer)
		} as unknown as File;

		const formData = new FormData();
		formData.set('alt_text', 'Alt text');
		Object.defineProperty(formData, 'get', {
			value: (key: string) => {
				if (key === 'screenshot') return file;
				if (key === 'alt_text') return 'Alt text';
				return null;
			}
		});

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'test' }
				})
			},
			params: { uuid: 'module@test' },
			cookies: {},
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as UploadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true, text: async () => '' } as Response);

		await actions.uploadScreenshot(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module@test/screenshots'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Accept: 'application/json',
					Authorization: 'Bearer token',
					'Content-Type': 'image/png'
				})
			})
		);

		const requestUrl = fetchMock.mock.calls[0][0] as string;
		expect(requestUrl).toContain('alt_text=Alt+text');

		const options = fetchMock.mock.calls[0][1] as RequestInit;
		expect(options.body).toBeInstanceOf(Uint8Array);
	});

	it('does not expose accessToken in returned session', async () => {
		const { load } = await import('./+page.server');
		const moduleData = {
			uuid: 'module@test',
			name: 'Test',
			description: 'Test',
			category: 'system',
			author: 'test',
			downloads: 0,
			verified_author: false,
			repo_url: 'https://example.com/test',
			tags: []
		};

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'Test' },
					accessToken: 'secret-token-should-not-leak'
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

		const result = await load(event);
		if (!result) throw new Error('expected result');

		expect(result.session).toBeDefined();
		expect(result.session).not.toHaveProperty('accessToken');
	});

	it('returns collections from the api response', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { load } = await import('./+page.server');
		const moduleData = {
			uuid: 'module@test',
			name: 'Test',
			description: 'Test',
			category: 'system',
			author: 'test',
			downloads: 0,
			verified_author: false,
			repo_url: 'https://example.com/test',
			tags: []
		};
		const collections = [
			{
				id: 1,
				user_id: 1,
				name: 'Favorites',
				description: null,
				visibility: 'private',
				module_count: 0,
				owner: { username: 'test' },
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			}
		];

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'Test' }
				})
			},
			params: { uuid: 'module@test' },
			cookies: { get: vi.fn().mockReturnValue(null) },
			fetch: vi.fn(async (url: string) => {
				if (url.includes('/versions')) {
					return { ok: true, json: async () => ({ versions: [] }) } as Response;
				}
				if (url.includes('/reviews')) {
					return { ok: true, json: async () => ({ reviews: [] }) } as Response;
				}
				if (url.includes('/screenshots')) {
					return { ok: true, json: async () => ({ screenshots: [] }) } as Response;
				}
				if (url.includes('/related')) {
					return { ok: true, json: async () => ({ modules: [] }) } as Response;
				}
				return { ok: true, json: async () => ({ data: moduleData }) } as Response;
			})
		} as unknown as LoadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ version: 1, collections, total: collections.length })
		} as Response);

		const result = await load(event);
		if (!result) throw new Error('expected result');

		expect(result.collections).toBeInstanceOf(Promise);
		await expect(result.collections).resolves.toEqual(collections);
	});

	it('fetches related modules from api', async () => {
		const { load } = await import('./+page.server');
		const moduleData = {
			uuid: 'module@test',
			name: 'Test',
			description: 'Test',
			category: 'system',
			author: 'test',
			downloads: 0,
			verified_author: false,
			repo_url: 'https://example.com/test',
			tags: []
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

		await load(event);

		expect(event.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module@test/related')
		);
	});

	it('awaits streaming data for data requests', async () => {
		const { resolveAccessToken } = await import('$lib/server/token');
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
		const { load } = await import('./+page.server');
		const moduleData = {
			uuid: 'module@test',
			name: 'Test',
			description: 'Test',
			category: 'system',
			author: 'test',
			downloads: 0,
			verified_author: false,
			repo_url: 'https://example.com/test',
			tags: []
		};
		const collections = [
			{
				id: 1,
				user_id: 1,
				name: 'Favorites',
				description: null,
				visibility: 'private',
				module_count: 0,
				owner: { username: 'test' },
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			}
		];

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'Test' }
				})
			},
			params: { uuid: 'module@test' },
			cookies: { get: vi.fn().mockReturnValue(null) },
			isDataRequest: true,
			fetch: vi.fn(async (url: string) => {
				if (url.includes('/versions')) {
					return { ok: true, json: async () => ({ versions: [] }) } as Response;
				}
				if (url.includes('/reviews')) {
					return { ok: true, json: async () => ({ reviews: [] }) } as Response;
				}
				if (url.includes('/screenshots')) {
					return { ok: true, json: async () => ({ screenshots: [] }) } as Response;
				}
				if (url.includes('/related')) {
					return { ok: true, json: async () => ({ modules: [] }) } as Response;
				}
				return { ok: true, json: async () => ({ data: moduleData }) } as Response;
			})
		} as unknown as LoadEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			ok: true,
			json: async () => ({ version: 1, collections, total: collections.length })
		} as Response);

		const result = await load(event);
		if (!result) throw new Error('expected result');

		expect(result.reviews).toEqual([]);
		expect(result.screenshots).toEqual([]);
		expect(result.relatedModules).toEqual([]);
		expect(result.collections).toEqual(collections);
	});
});

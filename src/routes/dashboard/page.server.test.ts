import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { actions, load } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

type UpdateProfileEvent = Parameters<typeof actions.updateProfile>[0];
type CreateCollectionEvent = Parameters<typeof actions.createCollection>[0];
type UpdateCollectionEvent = Parameters<typeof actions.updateCollection>[0];
type DeleteCollectionEvent = Parameters<typeof actions.deleteCollection>[0];
type LoadEvent = Parameters<typeof load>[0];

const baseEvent = {
	locals: {
		auth: vi.fn().mockResolvedValue({ user: { login: 'test' } })
	},
	cookies: {}
};

describe('dashboard page server actions', () => {
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
			...baseEvent,
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

	it('uses JSON headers for createCollection', async () => {
		const formData = new FormData();
		formData.set('name', 'My Collection');
		formData.set('description', 'Desc');
		formData.set('visibility', 'public');
		const event = {
			...baseEvent,
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as CreateCollectionEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true, text: async () => '' } as Response);

		await actions.createCollection(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/collections'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer token'
				})
			})
		);
	});

	it('uses JSON headers for updateCollection', async () => {
		const formData = new FormData();
		formData.set('id', '123');
		formData.set('name', 'Updated');
		formData.set('description', 'Desc');
		formData.set('visibility', 'private');
		const event = {
			...baseEvent,
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as UpdateCollectionEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await actions.updateCollection(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/collections/123'),
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

	it('uses Accept header for deleteCollection', async () => {
		const formData = new FormData();
		formData.set('id', '123');
		const event = {
			...baseEvent,
			request: { formData: vi.fn().mockResolvedValue(formData) }
		} as unknown as DeleteCollectionEvent;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await actions.deleteCollection(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/collections/123'),
			expect.objectContaining({
				method: 'DELETE',
				headers: expect.objectContaining({
					Accept: 'application/json',
					Authorization: 'Bearer token'
				})
			})
		);
	});
});

describe('dashboard page load', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('returns collections from the API response', async () => {
		const { load } = await import('./+page.server');
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

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
			const url = typeof input === 'string' ? input : input.toString();
			if (url.includes('/api/v1/users/me')) {
				return {
					ok: true,
					json: async () => ({
						version: 1,
						username: 'test',
						display_name: null,
						bio: null,
						website_url: null,
						created_at: '2024-01-01T00:00:00Z'
					})
				} as Response;
			}
			if (url.includes('/api/v1/modules/mine')) {
				return {
					ok: true,
					json: async () => ({ version: 1, modules: [] })
				} as Response;
			}
			if (url.includes('/api/v1/collections')) {
				return {
					ok: true,
					json: async () => ({ version: 1, collections, total: collections.length })
				} as Response;
			}
			return { ok: false } as Response;
		});

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({ user: { login: 'test' } })
			},
			cookies: {}
		} as unknown as LoadEvent;

		const result = await load(event);
		if (!result) throw new Error('Expected result');

		expect(result.collections).toBeInstanceOf(Promise);
		await expect(result.collections).resolves.toEqual(collections);
	});

	it('awaits collections for data requests', async () => {
		const { load } = await import('./+page.server');
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

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
			const url = typeof input === 'string' ? input : input.toString();
			if (url.includes('/api/v1/users/me')) {
				return {
					ok: true,
					json: async () => ({
						version: 1,
						username: 'test',
						display_name: null,
						bio: null,
						website_url: null,
						created_at: '2024-01-01T00:00:00Z'
					})
				} as Response;
			}
			if (url.includes('/api/v1/modules/mine')) {
				return {
					ok: true,
					json: async () => ({ version: 1, modules: [] })
				} as Response;
			}
			if (url.includes('/api/v1/collections')) {
				return {
					ok: true,
					json: async () => ({ version: 1, collections, total: collections.length })
				} as Response;
			}
			return { ok: false } as Response;
		});

		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({ user: { login: 'test' } })
			},
			cookies: {},
			isDataRequest: true
		} as unknown as LoadEvent;

		const result = await load(event);
		if (!result) throw new Error('Expected result');

		expect(result.collections).toEqual(collections);
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { load, actions } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

type LoadEvent = Parameters<typeof load>[0];
type ActionEvent = Parameters<(typeof actions)['removeModule']>[0];

const mockCollectionResponse = {
	collection: {
		id: 1,
		name: 'Test Collection',
		description: null,
		visibility: 'public',
		module_count: 0,
		owner: {
			username: 'test',
			display_name: null,
			avatar_url: null
		},
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z'
	},
	modules: []
};

describe('collections page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('uses Authorization header when access token is available', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue('token');
			const { load } = await import('./+page.server');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'test' } }) },
				params: { id: '1' },
				cookies: {}
			} as unknown as LoadEvent;

			const fetchMock = vi.mocked(fetch);
			fetchMock.mockResolvedValue({
				ok: true,
				json: async () => mockCollectionResponse
			} as Response);

			await load(event);

			expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v1/collections/1'), {
				headers: { Accept: 'application/json', Authorization: 'Bearer token' }
			});
		});

		it('throws 404 when collection not found', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue(null);
			const { load } = await import('./+page.server');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue(null) },
				params: { id: '999' },
				cookies: {}
			} as unknown as LoadEvent;

			vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as Response);

			await expect(load(event)).rejects.toMatchObject({ status: 404 });
		});

		it('throws 403 for private collection without permission', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue(null);
			const { load } = await import('./+page.server');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue(null) },
				params: { id: '1' },
				cookies: {}
			} as unknown as LoadEvent;

			vi.mocked(fetch).mockResolvedValue({ ok: false, status: 403 } as Response);

			await expect(load(event)).rejects.toMatchObject({ status: 403 });
		});

		it('sets isOwner true when session user matches collection owner', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue('token');
			const { load } = await import('./+page.server');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'test' } }) },
				params: { id: '1' },
				cookies: {}
			} as unknown as LoadEvent;

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: async () => mockCollectionResponse
			} as Response);

			const result = await load(event);
			if (!result) throw new Error('expected result');

			expect(result.isOwner).toBe(true);
		});

		it('sets isOwner false when session user differs from collection owner', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue('token');
			const { load } = await import('./+page.server');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'otheruser' } }) },
				params: { id: '1' },
				cookies: {}
			} as unknown as LoadEvent;

			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: async () => mockCollectionResponse
			} as Response);

			const result = await load(event);
			if (!result) throw new Error('expected result');

			expect(result.isOwner).toBe(false);
		});
	});

	describe('actions.removeModule', () => {
		it('returns 401 when not authenticated', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue(null);
			const { actions } = await import('./+page.server');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue(null) },
				params: { id: '1' },
				cookies: {},
				request: { formData: async () => new FormData() }
			} as unknown as ActionEvent;

			const result = await actions.removeModule(event);

			expect(result).toMatchObject({ status: 401, data: { message: 'Unauthorized' } });
		});

		it('returns 400 when module_uuid is missing', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue('token');
			const { actions } = await import('./+page.server');
			const formData = new FormData();
			const event = {
				locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'test' } }) },
				params: { id: '1' },
				cookies: {},
				request: { formData: async () => formData }
			} as unknown as ActionEvent;

			const result = await actions.removeModule(event);

			expect(result).toMatchObject({ status: 400, data: { message: 'Module UUID is required' } });
		});

		it('successfully removes module from collection', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue('token');
			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.set('module_uuid', 'test-uuid');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'test' } }) },
				params: { id: '1' },
				cookies: {},
				request: { formData: async () => formData }
			} as unknown as ActionEvent;

			vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

			const result = await actions.removeModule(event);

			expect(result).toEqual({ success: true });
			expect(fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/v1/collections/1/modules/test-uuid'),
				expect.objectContaining({ method: 'DELETE' })
			);
		});

		it('returns error status when API call fails', async () => {
			const { resolveAccessToken } = await import('$lib/server/token');
			vi.mocked(resolveAccessToken).mockResolvedValue('token');
			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.set('module_uuid', 'test-uuid');
			const event = {
				locals: { auth: vi.fn().mockResolvedValue({ user: { login: 'test' } }) },
				params: { id: '1' },
				cookies: {},
				request: { formData: async () => formData }
			} as unknown as ActionEvent;

			vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

			const result = await actions.removeModule(event);

			expect(result).toMatchObject({
				status: 500,
				data: { message: 'Failed to remove module from collection' }
			});
		});
	});
});

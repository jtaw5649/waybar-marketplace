import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, DELETE } from './+server';
import { resolveAccessToken } from '$lib/server/token';

const envMock = vi.hoisted(() => ({
	PUBLIC_API_BASE_URL: undefined as string | undefined
}));

vi.mock('$env/dynamic/public', () => ({
	env: envMock
}));

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn()
}));

type StarEvent = Parameters<typeof GET>[0];

const makeEvent = (): StarEvent =>
	({
		params: { uuid: 'module@test' },
		cookies: {} as StarEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue({ accessToken: 'token' }) }
	}) as unknown as StarEvent;

describe('module star api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('uses Authorization header for GET when token is present', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({})
		} as unknown as Response);

		await GET(makeEvent());

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module@test/star'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('uses Authorization header for POST', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await POST(makeEvent());

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module@test/star'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Authorization: 'Bearer token',
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('uses Authorization header for DELETE', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await DELETE(makeEvent());

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module@test/star'),
			expect.objectContaining({
				method: 'DELETE',
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('rejects POST when access token is missing', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce(null);
		await expect(POST(makeEvent())).rejects.toMatchObject({ status: 401 });
	});

	it('returns success false when upstream fails', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockRejectedValueOnce(new Error('boom'));

		const res = await POST(makeEvent());
		const body = await res.json();

		expect(body).toMatchObject({ success: false, starred: false, error: 'Internal error' });
		expect(res.status).toBe(500);
	});
});

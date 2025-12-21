import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, PUT, DELETE } from './+server';

type ReviewEvent = Parameters<typeof POST>[0];

const makeEvent = (accessToken?: string) =>
	({
		params: { uuid: 'module@test' },
		locals: {
			auth: vi.fn().mockResolvedValue(accessToken ? { accessToken } : null)
		},
		request: {
			json: vi.fn().mockResolvedValue({ rating: 5, title: 'Title', body: 'Body' })
		}
	} as unknown as ReviewEvent);

describe('reviews api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it.each([
		{ method: 'POST', handler: POST },
		{ method: 'PUT', handler: PUT }
	])('uses Authorization header for $method', async ({ method, handler }) => {
		const event = makeEvent('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await handler(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module%40test/reviews'),
			expect.objectContaining({
				method,
				headers: expect.objectContaining({
					Authorization: 'Bearer token',
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('uses Authorization header for DELETE', async () => {
		const event = makeEvent('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await DELETE(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/modules/module%40test/reviews'),
			expect.objectContaining({
				method: 'DELETE',
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('rejects when access token is missing', async () => {
		const event = makeEvent();
		await expect(POST(event)).rejects.toMatchObject({ status: 401 });
	});
});

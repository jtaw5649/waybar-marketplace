import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './+server';

type RejectEvent = Parameters<typeof POST>[0];

const makeEvent = (options?: { accessToken?: string; body?: unknown }) =>
	({
		params: { id: '123' },
		locals: {
			auth: vi
				.fn()
				.mockResolvedValue(options?.accessToken ? { accessToken: options.accessToken } : null)
		},
		request: {
			json: vi.fn().mockResolvedValue(options?.body ?? { reason: 'Nope' })
		}
	}) as unknown as RejectEvent;

describe('admin submission reject api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses Authorization header for reject', async () => {
		const event = makeEvent({ accessToken: 'token' });
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await POST(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/admin/submissions/123/reject'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Authorization: 'Bearer token',
					'Content-Type': 'application/json'
				})
			})
		);
	});

	it('rejects when access token is missing', async () => {
		const event = makeEvent();
		await expect(POST(event)).rejects.toMatchObject({ status: 401 });
	});

	it('rejects when reason is missing', async () => {
		const event = makeEvent({ accessToken: 'token', body: {} });
		await expect(POST(event)).rejects.toMatchObject({ status: 400 });
	});

	it('rejects when reason is not a string', async () => {
		const event = makeEvent({ accessToken: 'token', body: { reason: 12 } });
		await expect(POST(event)).rejects.toMatchObject({ status: 400 });
	});

	it('rejects when reason is empty', async () => {
		const event = makeEvent({ accessToken: 'token', body: { reason: '' } });
		await expect(POST(event)).rejects.toMatchObject({ status: 400 });
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './+server';

type ApproveEvent = Parameters<typeof POST>[0];

const makeEvent = (accessToken?: string) =>
	({
		params: { id: '123' },
		locals: {
			auth: vi.fn().mockResolvedValue(accessToken ? { accessToken } : null)
		}
	}) as unknown as ApproveEvent;

describe('admin submission approve api', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('uses Authorization header for approve', async () => {
		const event = makeEvent('token');
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValue({ ok: true } as Response);

		await POST(event);

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/admin/submissions/123/approve'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({ Authorization: 'Bearer token' })
			})
		);
	});

	it('rejects when access token is missing', async () => {
		const event = makeEvent();
		await expect(POST(event)).rejects.toMatchObject({ status: 401 });
	});
});

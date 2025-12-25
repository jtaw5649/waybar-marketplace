import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { actions } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

type UploadEvent = Parameters<typeof actions.upload>[0];

function createFormData(values: Record<string, string>, file: File) {
	return {
		get: (key: string) => {
			if (key === 'package') return file;
			return values[key] ?? null;
		}
	} as unknown as FormData;
}

function createEvent(file: File): UploadEvent {
	vi.mocked(resolveAccessToken).mockResolvedValue('token');
	const formData = createFormData(
		{
			name: 'Test',
			description: 'Desc',
			category: 'custom',
			version: '1.0.0',
			repo_url: 'https://example.com/repo',
			changelog: ''
		},
		file
	);

	return {
		cookies: {},
		locals: {
			auth: vi.fn().mockResolvedValue({
				user: { login: 'tester' }
			})
		},
		request: { formData: vi.fn().mockResolvedValue(formData) }
	} as unknown as UploadEvent;
}

describe('upload page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('rejects package uploads over 10mb', async () => {
		const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1));
		const file = {
			name: 'module.tar.gz',
			size: 11 * 1024 * 1024,
			type: 'application/gzip',
			arrayBuffer
		} as unknown as File;

		const result = (await actions.upload(createEvent(file))) as { status: number };

		expect(result.status).toBe(400);
		expect(arrayBuffer).not.toHaveBeenCalled();
	});

	it('rejects package uploads with invalid extension', async () => {
		const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1));
		const file = {
			name: 'module.zip',
			size: 1024,
			type: 'application/zip',
			arrayBuffer
		} as unknown as File;

		const result = (await actions.upload(createEvent(file))) as { status: number };

		expect(result.status).toBe(400);
		expect(arrayBuffer).not.toHaveBeenCalled();
	});

	it('uses JSON headers for create and publish, Accept for upload', async () => {
		const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1));
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer
		} as unknown as File;

		const event = createEvent(file);
		const fetchMock = vi.mocked(fetch);
		fetchMock
			.mockResolvedValueOnce({ ok: true, text: async () => '' } as Response)
			.mockResolvedValueOnce({ ok: true, text: async () => '' } as Response)
			.mockResolvedValueOnce({ ok: true, text: async () => '' } as Response);

		await actions.upload(event);

		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			expect.stringContaining('/api/v1/modules'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer token'
				})
			})
		);

		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			expect.stringContaining('/upload'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					Accept: 'application/json',
					Authorization: 'Bearer token'
				})
			})
		);

		expect(fetchMock).toHaveBeenNthCalledWith(
			3,
			expect.stringContaining('/publish'),
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
});

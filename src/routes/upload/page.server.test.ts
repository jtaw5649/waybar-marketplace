import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { actions } from './+page.server';

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
		locals: {
			auth: vi.fn().mockResolvedValue({
				user: { login: 'tester' },
				accessToken: 'token'
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
});

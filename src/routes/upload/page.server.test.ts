import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { actions, load } from './+page.server';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

type UploadEvent = Parameters<typeof actions.upload>[0];

function createFormData(values: Record<string, string>, file: File) {
	const formData = new FormData();
	for (const [key, value] of Object.entries(values)) {
		formData.set(key, value);
	}
	Object.defineProperty(formData, 'get', {
		value: (key: string) => {
			if (key === 'package') return file;
			return values[key] ?? null;
		}
	});
	return formData;
}

function createEvent(file: File): UploadEvent {
	vi.mocked(resolveAccessToken).mockResolvedValue('token');
	const formData = createFormData(
		{
			name: 'Test',
			description: 'Desc',
			category: 'custom',
			version: '1.0.0',
			license: 'MIT',
			repo_url: 'https://example.com/repo',
			changelog: '',
			'cf-turnstile-response': 'valid-token'
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
		request: { formData: vi.fn().mockResolvedValue(formData) },
		platform: { env: {} }
	} as unknown as UploadEvent;
}

function createEventWithTurnstile(
	file: File,
	turnstileToken: string | null,
	platform?: { env: { TURNSTILE_SECRET?: string } }
): UploadEvent {
	vi.mocked(resolveAccessToken).mockResolvedValue('token');
	const values: Record<string, string> = {
		name: 'Test',
		description: 'Desc',
		category: 'custom',
		version: '1.0.0',
		license: 'MIT',
		repo_url: 'https://example.com/repo',
		changelog: ''
	};
	if (turnstileToken) {
		values['cf-turnstile-response'] = turnstileToken;
	}
	const formData = createFormData(values, file);

	return {
		cookies: {},
		locals: {
			auth: vi.fn().mockResolvedValue({
				user: { login: 'tester' }
			})
		},
		request: { formData: vi.fn().mockResolvedValue(formData) },
		platform: platform ?? { env: { TURNSTILE_SECRET: 'test-secret' } }
	} as unknown as UploadEvent;
}

function createEventWithoutLicense(file: File): UploadEvent {
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
		request: { formData: vi.fn().mockResolvedValue(formData) },
		platform: { env: {} }
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

	it('load returns turnstile site key from platform env', async () => {
		const event = {
			locals: {
				auth: vi.fn().mockResolvedValue({
					user: { login: 'tester' }
				})
			},
			platform: { env: { TURNSTILE_SITE_KEY: 'test-site-key' } }
		};

		const result = (await load(event as unknown as Parameters<typeof load>[0])) as {
			turnstileSiteKey: string | undefined;
		};

		expect(result.turnstileSiteKey).toBe('test-site-key');
	});

	it('rejects upload without Turnstile token', async () => {
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1))
		} as unknown as File;

		const event = createEventWithTurnstile(file, null);
		const result = (await actions.upload(event)) as { status: number; data?: { message: string } };

		expect(result.status).toBe(400);
		expect(result.data?.message).toContain('verification');
	});

	it('allows upload without Turnstile token when secret is missing', async () => {
		const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1));
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer
		} as unknown as File;

		const fetchMock = vi.mocked(fetch);
		fetchMock
			.mockResolvedValueOnce(new Response(''))
			.mockResolvedValueOnce(new Response(''))
			.mockResolvedValueOnce(new Response(''));

		const event = createEventWithTurnstile(file, null, { env: {} });
		const result = (await actions.upload(event)) as { success?: boolean; uuid?: string };

		expect(result.success).toBe(true);
		expect(result.uuid).toBe('test@tester');
		expect(fetchMock).toHaveBeenCalledTimes(3);
	});

	it('rejects upload when Turnstile validation fails', async () => {
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1))
		} as unknown as File;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: false }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		const event = createEventWithTurnstile(file, 'invalid-token');
		const result = (await actions.upload(event)) as { status: number; data?: { message: string } };

		expect(result.status).toBe(400);
		expect(result.data?.message).toContain('verification');
	});

	it('rejects upload when Turnstile verification response is malformed', async () => {
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1))
		} as unknown as File;

		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(new Response('not-json', { status: 200 }));

		const event = createEventWithTurnstile(file, 'invalid-token');
		const result = (await actions.upload(event)) as { status: number; data?: { message: string } };

		expect(result.status).toBe(400);
		expect(result.data?.message).toContain('verification');
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

	it('rejects upload when license is missing', async () => {
		const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1));
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer
		} as unknown as File;

		const result = (await actions.upload(createEventWithoutLicense(file))) as {
			status: number;
			data?: { errors?: Record<string, string> };
		};

		expect(result.status).toBe(400);
		expect(result.data?.errors?.license).toBeDefined();
	});

	it('does not expose backend error bodies in responses', async () => {
		const arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(1));
		const file = {
			name: 'module.tar.gz',
			size: 1024,
			type: 'application/gzip',
			arrayBuffer
		} as unknown as File;

		const event = createEvent(file);
		const fetchMock = vi.mocked(fetch);
		fetchMock.mockResolvedValueOnce(new Response('Sensitive backend detail', { status: 400 }));

		const result = (await actions.upload(event)) as { status: number; data?: { message: string } };

		expect(result.status).toBe(400);
		expect(result.data?.message).toBe('Failed to create module');
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

	it('includes license in module creation payload', async () => {
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

		const [, options] = fetchMock.mock.calls[0] ?? [];
		const body = JSON.parse((options as RequestInit).body as string) as { license?: string };
		expect(body.license).toBe('MIT');
	});
});

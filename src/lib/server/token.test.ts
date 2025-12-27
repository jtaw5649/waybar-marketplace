import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerToken, resolveAccessToken } from './token';

const envMock = vi.hoisted(() => ({
	AUTH_SECRET: 'test-secret',
	NODE_ENV: 'test'
}));

vi.mock('$env/dynamic/private', () => ({
	env: envMock
}));

vi.mock('@auth/core/jwt', () => ({
	decode: vi.fn()
}));

import { decode } from '@auth/core/jwt';

function createMockCookies(cookies: Record<string, string>) {
	const entries = Object.entries(cookies).map(([name, value]) => ({ name, value }));
	return {
		get: (name: string) => cookies[name],
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(),
		getAll: vi.fn().mockReturnValue(entries)
	};
}

describe('getServerToken', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		envMock.AUTH_SECRET = 'test-secret';
		envMock.NODE_ENV = 'test';
	});
	it('returns null when no session cookie exists', async () => {
		const cookies = createMockCookies({});
		const result = await getServerToken(cookies as never);
		expect(result).toBeNull();
	});

	it('returns accessToken from decoded JWT', async () => {
		vi.mocked(decode).mockResolvedValueOnce({ accessToken: 'test-token-123' });
		const cookies = createMockCookies({ 'authjs.session-token': 'encrypted-jwt' });

		const result = await getServerToken(cookies as never);

		expect(result).toBe('test-token-123');
	});

	it('returns null when decode fails', async () => {
		vi.mocked(decode).mockRejectedValueOnce(new Error('decode failed'));
		const cookies = createMockCookies({ 'authjs.session-token': 'invalid-jwt' });

		const result = await getServerToken(cookies as never);

		expect(result).toBeNull();
	});

	it('uses secure cookie name as fallback', async () => {
		vi.mocked(decode).mockResolvedValueOnce({ accessToken: 'secure-token' });
		const cookies = createMockCookies({ '__Secure-authjs.session-token': 'secure-jwt' });

		const result = await getServerToken(cookies as never);

		expect(result).toBe('secure-token');
		expect(decode).toHaveBeenCalledWith(
			expect.objectContaining({
				token: 'secure-jwt',
				salt: '__Secure-authjs.session-token'
			})
		);
	});

	it('returns null when decoded token has no accessToken', async () => {
		vi.mocked(decode).mockResolvedValueOnce({ sub: 'user-id' });
		const cookies = createMockCookies({ 'authjs.session-token': 'jwt-no-token' });

		const result = await getServerToken(cookies as never);

		expect(result).toBeNull();
	});

	it('reassembles chunked session cookies before decoding', async () => {
		vi.mocked(decode).mockResolvedValueOnce({ accessToken: 'chunked-token' });
		const cookies = createMockCookies({
			'authjs.session-token.0': 'chunk-a',
			'authjs.session-token.1': 'chunk-b'
		});

		const result = await getServerToken(cookies as never);

		expect(result).toBe('chunked-token');
		expect(decode).toHaveBeenCalledWith(
			expect.objectContaining({
				token: 'chunk-achunk-b',
				salt: 'authjs.session-token'
			})
		);
	});

	it('uses provided auth secret for decoding', async () => {
		vi.mocked(decode).mockResolvedValueOnce({ accessToken: 'secret-token' });
		const cookies = createMockCookies({ 'authjs.session-token': 'encrypted-jwt' });

		await getServerToken(cookies as never, 'override-secret');

		expect(decode).toHaveBeenCalledWith(
			expect.objectContaining({
				secret: 'override-secret'
			})
		);
	});

	it('returns null when secret is missing outside production', async () => {
		envMock.AUTH_SECRET = undefined as unknown as string;
		envMock.NODE_ENV = 'development';
		const cookies = createMockCookies({ 'authjs.session-token': 'encrypted-jwt' });

		const result = await getServerToken(cookies as never);

		expect(result).toBeNull();
		expect(decode).not.toHaveBeenCalled();
	});

	it('throws when secret is missing in production', async () => {
		envMock.AUTH_SECRET = undefined as unknown as string;
		envMock.NODE_ENV = 'production';
		const cookies = createMockCookies({ 'authjs.session-token': 'encrypted-jwt' });

		await expect(getServerToken(cookies as never)).rejects.toThrow('AUTH_SECRET');
	});
});

describe('resolveAccessToken', () => {
	it('passes provided secret to token decoding', async () => {
		vi.mocked(decode).mockResolvedValueOnce({ accessToken: 'secret-token' });
		const cookies = createMockCookies({ 'authjs.session-token': 'encrypted-jwt' });

		const result = await resolveAccessToken(cookies as never, null, 'override-secret');

		expect(result).toBe('secret-token');
		expect(decode).toHaveBeenCalledWith(
			expect.objectContaining({
				secret: 'override-secret'
			})
		);
	});
});

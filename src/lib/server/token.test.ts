import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerToken } from './token';

vi.mock('$env/dynamic/private', () => ({
	env: { AUTH_SECRET: 'test-secret' }
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
});

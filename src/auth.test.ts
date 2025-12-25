import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	authJwtCallback,
	authSessionCallback,
	resolveTrustHost,
	sanitizeRefreshError
} from './auth';

describe('authJwtCallback', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('keeps access token when no expiresAt or refreshToken is present', async () => {
		const token = { accessToken: 'token' };
		const result = await authJwtCallback({ token });

		expect(result.accessToken).toBe('token');
		expect(result.error).toBeUndefined();
	});

	it('logs only sanitized error fields when refresh fails', async () => {
		const token = {
			accessToken: 'old-token',
			expiresAt: Math.floor(Date.now() / 1000) - 100,
			refreshToken: 'refresh-token'
		};

		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			json: async () => ({
				access_token: 'leaked-access-token',
				refresh_token: 'leaked-refresh-token',
				error: 'invalid_grant',
				error_description: 'Token expired'
			})
		} as Response);

		await authJwtCallback({ token });

		expect(console.error).toHaveBeenCalledWith(
			'[AUTH] Refresh failed:',
			expect.objectContaining({
				error: 'invalid_grant',
				error_description: 'Token expired'
			})
		);

		const loggedArg = vi.mocked(console.error).mock.calls[0][1];
		expect(loggedArg).not.toHaveProperty('access_token');
		expect(loggedArg).not.toHaveProperty('refresh_token');
	});
});

describe('sanitizeRefreshError', () => {
	it('extracts only error fields from refresh response', () => {
		const tokens = {
			access_token: 'secret-access-token',
			refresh_token: 'secret-refresh-token',
			error: 'invalid_grant',
			error_description: 'Token has been revoked'
		};

		const result = sanitizeRefreshError(tokens);

		expect(result).toEqual({
			error: 'invalid_grant',
			error_description: 'Token has been revoked'
		});
		expect(result).not.toHaveProperty('access_token');
		expect(result).not.toHaveProperty('refresh_token');
	});
});

describe('authSessionCallback', () => {
	it('does NOT expose accessToken to session (server-only tokens)', async () => {
		const session = { user: { id: '123', name: 'Test' } } as never;
		const token = {
			sub: 'user-id',
			login: 'testuser',
			accessToken: 'secret-access-token',
			error: undefined
		};

		const result = await authSessionCallback({ session, token });

		expect(result).not.toHaveProperty('accessToken');
		expect(result.user?.id).toBe('user-id');
		expect(result.user?.login).toBe('testuser');
	});

	it('includes error in session when present', async () => {
		const session = { user: { id: '123' } } as never;
		const token = {
			sub: 'user-id',
			error: 'RefreshTokenError'
		};

		const result = await authSessionCallback({ session, token });

		expect(result.error).toBe('RefreshTokenError');
		expect(result).not.toHaveProperty('accessToken');
	});
});

describe('resolveTrustHost', () => {
	it('enables trustHost for non-production', () => {
		expect(resolveTrustHost('development', undefined)).toBe(true);
	});

	it('enables trustHost in production without flag', () => {
		expect(resolveTrustHost('production', undefined)).toBe(true);
	});

	it('disables trustHost in production with false flag', () => {
		expect(resolveTrustHost('production', 'false')).toBe(false);
	});

	it('enables trustHost in production with empty flag', () => {
		expect(resolveTrustHost('production', '')).toBe(true);
	});

	it('enables trustHost in production with flag', () => {
		expect(resolveTrustHost('production', 'true')).toBe(true);
	});
});

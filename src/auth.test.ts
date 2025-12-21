import { describe, it, expect } from 'vitest';
import { authJwtCallback, resolveTrustHost } from './auth';

describe('authJwtCallback', () => {
	it('keeps access token when no expiresAt or refreshToken is present', async () => {
		const token = { accessToken: 'token' };
		const result = await authJwtCallback({ token });

		expect(result.accessToken).toBe('token');
		expect(result.error).toBeUndefined();
	});
});

describe('resolveTrustHost', () => {
	it('enables trustHost for non-production', () => {
		expect(resolveTrustHost('development', undefined)).toBe(true);
	});

	it('disables trustHost in production without flag', () => {
		expect(resolveTrustHost('production', undefined)).toBe(false);
	});

	it('enables trustHost in production with flag', () => {
		expect(resolveTrustHost('production', 'true')).toBe(true);
	});
});

import { describe, it, expect } from 'vitest';
import { authJwtCallback } from './auth';

describe('authJwtCallback', () => {
	it('keeps access token when no expiresAt or refreshToken is present', async () => {
		const token = { accessToken: 'token' };
		const result = await authJwtCallback({ token });

		expect(result.accessToken).toBe('token');
		expect(result.error).toBeUndefined();
	});
});

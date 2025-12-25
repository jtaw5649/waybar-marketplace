import { describe, it, expect, vi } from 'vitest';
import { requireAccessToken } from './requireAccessToken';

vi.mock('$lib/server/token', () => ({
	getServerToken: vi.fn(),
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

function createMockCookies() {
	return {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(),
		getAll: vi.fn()
	};
}

describe('requireAccessToken', () => {
	it('returns token when resolveAccessToken succeeds', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce('valid-token');
		const cookies = createMockCookies();

		const result = await requireAccessToken(cookies as never);

		expect(result).toBe('valid-token');
	});

	it('throws 401 error when no token available', async () => {
		vi.mocked(resolveAccessToken).mockResolvedValueOnce(null);
		const cookies = createMockCookies();

		await expect(requireAccessToken(cookies as never)).rejects.toMatchObject({
			status: 401
		});
	});
});

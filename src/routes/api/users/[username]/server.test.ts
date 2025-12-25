import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET } from './+server';

describe('GET /api/users/[username]', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('returns user profile from backend', async () => {
		const mockProfile = {
			version: 1,
			data: {
				id: 1,
				username: 'testuser',
				display_name: 'Test User',
				avatar_url: 'https://example.com/avatar.png',
				bio: 'A test user',
				verified_author: true,
				module_count: 5
			}
		};

		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockProfile)
		});

		const response = await GET({
			params: { username: 'testuser' }
		} as never);

		const data = await response.json();
		expect(data.data.username).toBe('testuser');
		expect(data.data.module_count).toBe(5);
	});

	it('throws 404 for non-existent user', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 404
		});

		await expect(
			GET({
				params: { username: 'nonexistent' }
			} as never)
		).rejects.toMatchObject({ status: 404 });
	});
});

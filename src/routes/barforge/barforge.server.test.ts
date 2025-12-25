import { describe, expect, it, vi } from 'vitest';

describe('Barforge page server load', () => {
	it('returns combined stats from both repositories', async () => {
		const { load } = await import('./+page.server');

		const mockFetch = vi.fn().mockImplementation((url: string) => {
			if (url.includes('barforge-web') && !url.includes('contributors')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ stargazers_count: 5, forks_count: 2 })
				});
			}
			if (url.includes('barforge-app') && !url.includes('contributors')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ stargazers_count: 10, forks_count: 3 })
				});
			}
			if (url.includes('contributors')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve([{ login: 'user1' }])
				});
			}
			return Promise.resolve({ ok: false });
		});

		const result = await load({
			fetch: mockFetch,
			setHeaders: vi.fn()
		} as never);

		expect(result).toBeDefined();
		const { stats } = result as { stats: { stars: number; forks: number; contributors: number } };
		expect(stats.stars).toBe(15);
		expect(stats.forks).toBe(5);
		expect(stats.contributors).toBe(1);
	});
});

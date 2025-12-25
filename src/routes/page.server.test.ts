import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';

vi.mock('$lib', () => ({
	API_BASE_URL: 'https://api.example.com'
}));

type LoadEvent = Parameters<typeof load>[0];

describe('root page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns landing data from /api/v1/landing', async () => {
		const setHeaders = vi.fn();
		const mockLanding = {
			stats: {
				total_modules: 123,
				total_downloads: 4567,
				total_authors: 42
			},
			install_methods: [
				{
					id: 'recommended',
					label: 'Pre-built binary',
					description: 'Fast install',
					commands: ['curl https://example.com | sh']
				}
			]
		};
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ version: 1, ...mockLanding })
		});

		const result = await load({
			fetch: fetchMock,
			setHeaders
		} as unknown as LoadEvent);

		expect(setHeaders).toHaveBeenCalledWith({
			'cache-control': 'private, max-age=60',
			vary: 'cookie'
		});
		expect((result as { landing: unknown }).landing).toEqual(mockLanding);
		expect((result as { error: unknown }).error).toBeNull();
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/landing'),
			expect.any(Object)
		);
	});
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { load } from './+page.server';

vi.mock('$lib', () => ({
	API_BASE_URL: 'https://api.example.com'
}));

type LoadEvent = Parameters<typeof load>[0];

describe('browse page server', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns featuredData from /api/v1/featured', async () => {
		const mockFeaturedData = {
			featured: [{ uuid: '1', name: 'Featured Module' }],
			popular: [{ uuid: '2', name: 'Popular Module' }],
			recent: [{ uuid: '3', name: 'Recent Module' }]
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockFeaturedData
		});

		const result = await load({
			fetch: fetchMock,
			setHeaders: vi.fn()
		} as unknown as LoadEvent);

		expect(result).toBeDefined();
		expect((result as { featuredData: unknown }).featuredData).toEqual(mockFeaturedData);
		expect((result as { error: unknown }).error).toBeNull();
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/featured'),
			expect.any(Object)
		);
	});
});

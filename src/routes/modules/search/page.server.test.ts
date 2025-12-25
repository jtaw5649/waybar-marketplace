import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load } from './+page.server';

vi.mock('$lib', () => ({
	API_BASE_URL: 'https://api.example.com'
}));

vi.mock('$lib/server/cacheHeaders', () => ({
	privateCacheHeaders: {
		'cache-control': 'private, max-age=60',
		vary: 'cookie'
	}
}));

vi.mock('$lib/server/apiClient', () => ({
	fetchApiJson: vi.fn().mockResolvedValue({ data: { modules: [] } })
}));

type LoadEvent = Parameters<typeof load>[0];

describe('browse page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('sets cache-control headers for browse data', async () => {
		const setHeaders = vi.fn();
		const fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ modules: [] })
		});
		const url = new URL('https://example.com/modules');

		await load({ fetch, url, setHeaders } as unknown as LoadEvent);

		expect(setHeaders).toHaveBeenCalledWith({
			'cache-control': 'private, max-age=60',
			vary: 'cookie'
		});
	});
});

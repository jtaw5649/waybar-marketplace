// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import {
	OFFLINE_URL,
	buildPrecacheList,
	isCacheablePath,
	networkFirst,
	registerServiceWorker,
	shouldCacheRequest,
	staleWhileRevalidate
} from './serviceWorker';

describe('service worker helpers', () => {
	it('builds a unique precache list including offline fallback', () => {
		const list = buildPrecacheList(['/app.js', '/app.css'], ['/branding/logo.png']);

		expect(list).toContain('/app.js');
		expect(list).toContain('/branding/logo.png');
		expect(list).toContain(OFFLINE_URL);
		expect(new Set(list).size).toBe(list.length);
	});

	it('detects cacheable asset paths', () => {
		expect(isCacheablePath('/_app/immutable/entry.js')).toBe(true);
		expect(isCacheablePath('/fonts/space-grotesk-500.ttf')).toBe(true);
		expect(isCacheablePath('/branding/avatar-light-512.png')).toBe(true);
		expect(isCacheablePath('/screenshots/homepage.png')).toBe(true);
		expect(isCacheablePath('/api/v1/modules')).toBe(false);
	});

	it('only caches same-origin GET requests for cacheable paths', () => {
		const origin = 'https://barforge.dev';
		const request = new Request('https://barforge.dev/_app/immutable/entry.js', { method: 'GET' });
		const crossOrigin = new Request('https://api.barforge.dev/_app/immutable/entry.js', {
			method: 'GET'
		});
		const postRequest = new Request('https://barforge.dev/_app/immutable/entry.js', {
			method: 'POST'
		});

		expect(shouldCacheRequest(request, origin)).toBe(true);
		expect(shouldCacheRequest(crossOrigin, origin)).toBe(false);
		expect(shouldCacheRequest(postRequest, origin)).toBe(false);
	});

	it('returns cached response and refreshes in background', async () => {
		const request = new Request('https://barforge.dev/_app/immutable/entry.js');
		const cached = new Response('cached');
		const fetched = new Response('fetched');
		const cache = {
			match: vi.fn().mockResolvedValueOnce(cached),
			put: vi.fn().mockResolvedValue(undefined)
		};
		const fetcher = vi.fn().mockResolvedValueOnce(fetched);

		const response = await staleWhileRevalidate(request, cache, fetcher);

		expect(response).toBe(cached);
		expect(fetcher).toHaveBeenCalledWith(request);
		expect(cache.put).toHaveBeenCalled();
	});

	it('falls back to cache when network fails', async () => {
		const request = new Request('https://barforge.dev/');
		const cached = new Response('cached');
		const offline = new Response('offline');
		const cache = {
			match: vi.fn((key: Request | string) =>
				Promise.resolve(key === OFFLINE_URL ? offline : cached)
			),
			put: vi.fn().mockResolvedValue(undefined)
		};
		const fetcher = vi.fn().mockRejectedValueOnce(new Error('offline'));

		const response = await networkFirst(request, cache, fetcher, OFFLINE_URL);

		expect(response).toBe(cached);
		expect(cache.match).toHaveBeenCalledWith(request);
	});

	it('returns offline fallback when cache misses', async () => {
		const request = new Request('https://barforge.dev/');
		const offline = new Response('offline');
		const cache = {
			match: vi.fn((key: Request | string) =>
				Promise.resolve(key === OFFLINE_URL ? offline : undefined)
			),
			put: vi.fn().mockResolvedValue(undefined)
		};
		const fetcher = vi.fn().mockRejectedValueOnce(new Error('offline'));

		const response = await networkFirst(request, cache, fetcher, OFFLINE_URL);

		expect(response).toBe(offline);
		expect(cache.match).toHaveBeenCalledWith(OFFLINE_URL);
	});

	it('registers the service worker when supported', async () => {
		const register = vi.fn().mockResolvedValue({});
		Object.defineProperty(navigator, 'serviceWorker', {
			value: { register },
			configurable: true
		});

		await registerServiceWorker();

		expect(register).toHaveBeenCalledWith('/service-worker.js');
	});

	it('no-ops when service workers are unavailable', async () => {
		Object.defineProperty(navigator, 'serviceWorker', {
			value: undefined,
			configurable: true
		});

		await expect(registerServiceWorker()).resolves.toBeNull();
	});
});

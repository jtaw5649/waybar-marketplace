export const OFFLINE_URL = '/offline.html';

const CACHEABLE_PREFIXES = ['/_app/immutable/', '/fonts/', '/branding/', '/screenshots/'] as const;
const WELL_KNOWN_PREFIX = '/.well-known/';

const shouldPrecachePath = (path: string): boolean => {
	if (path === '/.well-known') {
		return true;
	}

	if (path.startsWith(WELL_KNOWN_PREFIX)) {
		return true;
	}

	return !path.startsWith('/.');
};

export const buildPrecacheList = (build: string[], files: string[]): string[] => {
	const combined = [...build, ...files, OFFLINE_URL];
	return Array.from(new Set(combined.filter(shouldPrecachePath)));
};

export const isCacheablePath = (path: string): boolean => {
	if (CACHEABLE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
		return true;
	}

	return path === '/favicon.ico' || path === '/og.png';
};

export const shouldCacheRequest = (request: Request, origin: string): boolean => {
	if (request.method !== 'GET') {
		return false;
	}

	const url = new URL(request.url);
	if (url.origin !== origin) {
		return false;
	}

	return isCacheablePath(url.pathname);
};

type CacheLike = {
	match: (request: Request | string) => Promise<Response | undefined>;
	put: (request: Request, response: Response) => Promise<void> | void;
};

export const staleWhileRevalidate = async (
	request: Request,
	cache: CacheLike,
	fetcher: typeof fetch
): Promise<Response> => {
	const cached = await cache.match(request);
	const fetchPromise = fetcher(request).then((response) => {
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	});

	if (cached) {
		void fetchPromise;
		return cached;
	}

	return fetchPromise;
};

export const networkFirst = async (
	request: Request,
	cache: CacheLike,
	fetcher: typeof fetch,
	offlineUrl: string
): Promise<Response> => {
	try {
		const response = await fetcher(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await cache.match(request);
		if (cached) {
			return cached;
		}

		const offline = await cache.match(offlineUrl);
		return offline ?? new Response('Offline', { status: 503 });
	}
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
	if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
		return null;
	}

	return navigator.serviceWorker.register('/service-worker.js');
};

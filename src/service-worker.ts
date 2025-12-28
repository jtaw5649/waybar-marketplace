/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';
import {
	buildPrecacheList,
	networkFirst,
	OFFLINE_URL,
	shouldCacheRequest,
	staleWhileRevalidate
} from '$lib/utils/serviceWorker';

const CACHE_NAME = `barforge-web-${version}`;

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(buildPrecacheList(build, files)))
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
			)
	);
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') {
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(
			caches.open(CACHE_NAME).then((cache) => networkFirst(request, cache, fetch, OFFLINE_URL))
		);
		return;
	}

	if (!shouldCacheRequest(request, self.location.origin)) {
		return;
	}

	event.respondWith(
		caches.open(CACHE_NAME).then((cache) => staleWhileRevalidate(request, cache, fetch))
	);
});

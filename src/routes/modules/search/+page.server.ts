import { privateCacheHeaders } from '$lib/server/cacheHeaders';
import { fetchApiJson } from '$lib/server/apiClient';
import type { Module } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url, setHeaders }) => {
	setHeaders(privateCacheHeaders);
	const result = await fetchApiJson<{ modules?: Module[] }>(fetch, '/api/v1/index');
	if (result.error) {
		return {
			modules: [] as Module[],
			error: result.error,
			initialQuery: url.searchParams.get('q') || '',
			initialCategory: url.searchParams.get('category') || '',
			initialSort: url.searchParams.get('sort') || 'popular',
			initialPage: parseInt(url.searchParams.get('page') || '1')
		};
	}

	const data = result.data ?? {};

	return {
		modules: (data.modules || []) as Module[],
		error: null as string | null,
		initialQuery: url.searchParams.get('q') || '',
		initialCategory: url.searchParams.get('category') || '',
		initialSort: url.searchParams.get('sort') || 'popular',
		initialPage: parseInt(url.searchParams.get('page') || '1')
	};
};

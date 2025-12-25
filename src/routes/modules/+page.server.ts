import { privateCacheHeaders } from '$lib/server/cacheHeaders';
import { fetchApiJson } from '$lib/server/apiClient';
import type { Module } from '$lib/types';
import type { PageServerLoad } from './$types';

interface FeaturedData {
	featured: Module[];
	popular: Module[];
	recent: Module[];
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders(privateCacheHeaders);
	const result = await fetchApiJson<FeaturedData>(fetch, '/api/v1/featured');
	if (result.error) {
		return {
			featuredData: null as FeaturedData | null,
			error: result.error
		};
	}

	return {
		featuredData: result.data as FeaturedData,
		error: null as string | null
	};
};

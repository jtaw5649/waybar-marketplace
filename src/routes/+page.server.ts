import { privateCacheHeaders } from '$lib/server/cacheHeaders';
import { fetchApiJson } from '$lib/server/apiClient';
import type { LandingData, LandingResponse } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders(privateCacheHeaders);
	const result = await fetchApiJson<LandingResponse>(fetch, '/api/v1/landing');
	if (result.error || !result.data) {
		return {
			landing: null as LandingData | null,
			error: result.error
		};
	}

	return {
		landing: {
			stats: result.data.stats,
			install_methods: result.data.install_methods
		},
		error: null as string | null
	};
};

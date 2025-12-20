import { API_BASE_URL } from '$lib';
import { classifyApiError } from '$lib/utils/apiError';
import type { Module } from '$lib/types';
import type { PageServerLoad } from './$types';

interface FeaturedData {
	featured: Module[];
	popular: Module[];
	recent: Module[];
}

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/featured`);

		if (!res.ok) {
			const classified = classifyApiError(null, res.status);
			return {
				featuredData: null as FeaturedData | null,
				error: classified.userMessage
			};
		}

		const data: FeaturedData = await res.json();

		return {
			featuredData: data,
			error: null as string | null
		};
	} catch (e) {
		const classified = classifyApiError(e);
		return {
			featuredData: null as FeaturedData | null,
			error: classified.userMessage
		};
	}
};

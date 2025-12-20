import { API_BASE_URL } from '$lib';
import { classifyApiError } from '$lib/utils/apiError';
import type { Module } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/index`);

		if (!res.ok) {
			const classified = classifyApiError(null, res.status);
			return {
				modules: [] as Module[],
				error: classified.userMessage,
				initialQuery: url.searchParams.get('q') || '',
				initialCategory: url.searchParams.get('category') || '',
				initialSort: url.searchParams.get('sort') || 'popular',
				initialPage: parseInt(url.searchParams.get('page') || '1')
			};
		}

		const data = await res.json();

		return {
			modules: (data.modules || []) as Module[],
			error: null as string | null,
			initialQuery: url.searchParams.get('q') || '',
			initialCategory: url.searchParams.get('category') || '',
			initialSort: url.searchParams.get('sort') || 'popular',
			initialPage: parseInt(url.searchParams.get('page') || '1')
		};
	} catch (e) {
		const classified = classifyApiError(e);
		return {
			modules: [] as Module[],
			error: classified.userMessage,
			initialQuery: url.searchParams.get('q') || '',
			initialCategory: url.searchParams.get('category') || '',
			initialSort: url.searchParams.get('sort') || 'popular',
			initialPage: parseInt(url.searchParams.get('page') || '1')
		};
	}
};

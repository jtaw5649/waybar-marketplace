import { API_BASE_URL } from '$lib';
import { acceptHeaders, type HeaderMap } from '$lib/server/authHeaders';
import { classifyApiError } from '$lib/utils/apiError';

export type ApiResult<T> = { data: T | null; error: string | null };

export type FetchApiOptions = {
	token?: string;
	headers?: HeaderMap;
};

export async function fetchApiJson<T>(
	fetcher: typeof fetch,
	path: string,
	options: FetchApiOptions = {}
): Promise<ApiResult<T>> {
	try {
		const res = await fetcher(`${API_BASE_URL}${path}`, {
			headers: acceptHeaders(options.token, options.headers)
		});

		if (!res.ok) {
			const classified = classifyApiError(null, res.status);
			return { data: null, error: classified.userMessage };
		}

		const data = (await res.json()) as T;
		return { data, error: null };
	} catch (error) {
		const classified = classifyApiError(error);
		return { data: null, error: classified.userMessage };
	}
}

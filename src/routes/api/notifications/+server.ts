import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

export const GET: RequestHandler = async ({ cookies, locals, url, platform }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session, platform?.env?.AUTH_SECRET);
	if (!accessToken) {
		throw error(401, 'Unauthorized');
	}

	const limit = url.searchParams.get('limit') || '20';
	const offset = url.searchParams.get('offset') || '0';

	const res = await fetch(`${API_BASE_URL}/api/v1/notifications?limit=${limit}&offset=${offset}`, {
		headers: acceptHeaders(accessToken)
	});

	if (!res.ok) {
		throw error(res.status, 'Failed to fetch notifications');
	}

	const data = await res.json();
	return json(data);
};

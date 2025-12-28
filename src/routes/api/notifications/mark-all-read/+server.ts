import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ cookies, locals, platform }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session, platform?.env?.AUTH_SECRET);
	if (!accessToken) {
		throw error(401, 'Unauthorized');
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/notifications/mark-all-read`, {
		method: 'POST',
		headers: jsonHeaders(accessToken)
	});

	if (!res.ok) {
		throw error(res.status, 'Failed to mark notifications as read');
	}

	const data = await res.json();
	return json(data);
};

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { acceptHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

export const GET: RequestHandler = async ({ cookies, locals, platform }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session, platform?.env?.AUTH_SECRET);
	if (!accessToken) {
		throw error(401, 'Unauthorized');
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/notifications/preferences`, {
		headers: acceptHeaders(accessToken)
	});

	if (!res.ok) {
		throw error(res.status, 'Failed to load notification preferences');
	}

	const data = await res.json();
	return json(data);
};

export const PATCH: RequestHandler = async ({ request, cookies, locals, platform }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session, platform?.env?.AUTH_SECRET);
	if (!accessToken) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const res = await fetch(`${API_BASE_URL}/api/v1/notifications/preferences`, {
		method: 'PATCH',
		headers: jsonHeaders(accessToken),
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		throw error(res.status, 'Failed to update notification preferences');
	}

	const data = await res.json();
	return json(data);
};

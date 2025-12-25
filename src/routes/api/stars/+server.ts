import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

export const GET: RequestHandler = async ({ cookies, locals }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session);
	if (!accessToken) {
		return json({ data: { modules: [], total: 0 } });
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/users/me/stars`, {
		headers: acceptHeaders(accessToken)
	});

	if (!res.ok) {
		return json({ data: { modules: [], total: 0 } });
	}

	const data = await res.json();
	return json(data);
};

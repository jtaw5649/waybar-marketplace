import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { acceptHeaders } from '$lib/server/authHeaders';
import { requireAccessToken } from '$lib/utils/requireAccessToken';

export const POST: RequestHandler = async ({ params, cookies, locals }) => {
	const session = await locals.auth();
	const accessToken = await requireAccessToken(cookies, session);
	const res = await fetch(`${API_BASE_URL}/api/v1/admin/submissions/${params.id}/approve`, {
		method: 'POST',
		headers: acceptHeaders(accessToken)
	});

	if (!res.ok) {
		error(res.status, 'Failed to approve submission');
	}

	return json({ success: true });
};

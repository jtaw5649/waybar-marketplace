import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { requireAccessToken } from '$lib/utils/requireAccessToken';

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const accessToken = await requireAccessToken(locals);
	const body = await request.json();
	const res = await fetch(`${API_BASE_URL}/api/v1/admin/submissions/${params.id}/reject`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		error(res.status, 'Failed to reject submission');
	}

	return json({ success: true });
};

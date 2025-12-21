import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { requireAccessToken } from '$lib/utils/requireAccessToken';

export const POST: RequestHandler = async ({ params, locals }) => {
	const accessToken = await requireAccessToken(locals);
	const res = await fetch(`${API_BASE_URL}/api/v1/admin/submissions/${params.id}/approve`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (!res.ok) {
		error(res.status, 'Failed to approve submission');
	}

	return json({ success: true });
};

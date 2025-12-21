import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { requireAccessToken } from '$lib/utils/requireAccessToken';

export const POST: RequestHandler = async ({ params, locals, request }) => {
	const accessToken = await requireAccessToken(locals);
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid request body');
	}

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		error(400, 'Invalid request body');
	}

	const reason = (body as { reason?: unknown }).reason;
	if (typeof reason !== 'string' || reason.length === 0) {
		error(400, 'Invalid rejection reason');
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/admin/submissions/${params.id}/reject`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ reason })
	});

	if (!res.ok) {
		error(res.status, 'Failed to reject submission');
	}

	return json({ success: true });
};

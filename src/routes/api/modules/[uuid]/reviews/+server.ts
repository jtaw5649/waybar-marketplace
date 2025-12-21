import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';

async function getAccessToken(locals: App.Locals): Promise<string | null> {
	const session = await locals.auth();
	return session?.accessToken ?? null;
}

async function forwardReviewRequest(
	method: 'POST' | 'PUT' | 'DELETE',
	locals: App.Locals,
	uuid: string,
	request: Request
) {
	const accessToken = await getAccessToken(locals);
	if (!accessToken) {
		error(401, 'Unauthorized');
	}

	const headers: HeadersInit = { Authorization: `Bearer ${accessToken}` };
	let body: string | undefined;

	if (method !== 'DELETE') {
		headers['Content-Type'] = 'application/json';
		body = JSON.stringify(await request.json());
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/reviews`, {
		method,
		headers,
		body
	});

	if (!res.ok) {
		error(res.status, 'Failed to submit review');
	}

	return json({ success: true });
}

export const POST: RequestHandler = async ({ params, locals, request }) =>
	forwardReviewRequest('POST', locals, params.uuid, request);

export const PUT: RequestHandler = async ({ params, locals, request }) =>
	forwardReviewRequest('PUT', locals, params.uuid, request);

export const DELETE: RequestHandler = async ({ params, locals, request }) =>
	forwardReviewRequest('DELETE', locals, params.uuid, request);

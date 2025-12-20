import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';

async function getAccessToken(locals: App.Locals): Promise<string | null> {
	const session = await locals.auth();
	return session?.accessToken ?? null;
}

export const GET: RequestHandler = async ({ params, locals }) => {
	const { uuid } = params;
	const accessToken = await getAccessToken(locals);

	const headers: HeadersInit = {};
	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/star`, {
		headers
	});

	if (!res.ok) {
		error(res.status, 'Failed to get star status');
	}

	const data = await res.json();
	return json(data);
};

export const POST: RequestHandler = async ({ params, locals }) => {
	const accessToken = await getAccessToken(locals);
	if (!accessToken) {
		error(401, 'Unauthorized');
	}

	const { uuid } = params;

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/star`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify({ is_public: true })
	});

	if (!res.ok) {
		error(res.status, 'Failed to star module');
	}

	return json({ success: true, starred: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const accessToken = await getAccessToken(locals);
	if (!accessToken) {
		error(401, 'Unauthorized');
	}

	const { uuid } = params;

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/star`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!res.ok && res.status !== 404) {
		error(res.status, 'Failed to unstar module');
	}

	return json({ success: true, starred: false });
};

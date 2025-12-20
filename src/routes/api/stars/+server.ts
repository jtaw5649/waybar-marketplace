import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.accessToken) {
		return json({ data: { modules: [], total: 0 } });
	}

	const res = await fetch(`${API_BASE_URL}/api/v1/users/me/stars`, {
		headers: {
			Authorization: `Bearer ${session.accessToken}`
		}
	});

	if (!res.ok) {
		return json({ data: { modules: [], total: 0 } });
	}

	const data = await res.json();
	return json(data);
};

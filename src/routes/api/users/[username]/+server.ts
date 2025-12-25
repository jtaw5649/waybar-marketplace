import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';

export const GET: RequestHandler = async ({ params }) => {
	const { username } = params;

	const res = await fetch(`${API_BASE_URL}/api/v1/users/${encodeURIComponent(username)}`);

	if (!res.ok) {
		if (res.status === 404) {
			error(404, 'User not found');
		}
		error(res.status, 'Failed to fetch user');
	}

	const data = await res.json();
	return json(data);
};

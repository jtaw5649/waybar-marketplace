import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { encodeModuleUuid } from '$lib/utils/url';

export const GET: RequestHandler = async ({ params }) => {
	const { uuid } = params;

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}`);

	if (!res.ok) {
		if (res.status === 404) {
			error(404, 'Module not found');
		}
		error(res.status, 'Failed to fetch module');
	}

	const data = await res.json();
	return json(data);
};

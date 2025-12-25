import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_BASE_URL } from '$lib';
import { authHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { encodeModuleUuid } from '$lib/utils/url';

export const GET: RequestHandler = async ({ params, cookies, locals }) => {
	const { uuid } = params;
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session);
	const headers = authHeaders(accessToken ?? undefined);

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/star`, {
		headers
	});

	if (!res.ok) {
		error(res.status, 'Failed to get star status');
	}

	const data = await res.json();
	return json(data);
};

export const POST: RequestHandler = async ({ params, cookies, locals }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session);
	if (!accessToken) {
		error(401, 'Unauthorized');
	}

	const { uuid } = params;

	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/star`, {
			method: 'POST',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({ is_public: true })
		});

		if (!res.ok) {
			if (res.status === 404) {
				return json({ success: false, starred: false, error: 'Module not found' }, { status: 404 });
			}
			return json(
				{ success: false, starred: false, error: 'Failed to star module' },
				{ status: res.status }
			);
		}

		return json({ success: true, starred: true });
	} catch (err) {
		console.error('Star API error:', err);
		return json({ success: false, starred: false, error: 'Internal error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, cookies, locals }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session);
	if (!accessToken) {
		error(401, 'Unauthorized');
	}

	const { uuid } = params;

	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/star`, {
			method: 'DELETE',
			headers: authHeaders(accessToken)
		});

		if (!res.ok && res.status !== 404) {
			return json(
				{ success: false, starred: true, error: 'Failed to unstar module' },
				{ status: res.status }
			);
		}

		return json({ success: true, starred: false });
	} catch (err) {
		console.error('Star API error:', err);
		return json({ success: false, starred: true, error: 'Internal error' }, { status: 500 });
	}
};

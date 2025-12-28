import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Session } from '@auth/sveltekit';
import type { Cookies } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { authHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { encodeModuleUuid } from '$lib/utils/url';
import { parseJson } from '$lib/server/formValidation';
import { CreateReviewSchema } from '$lib/schemas/module';

async function forwardReviewRequest(
	method: 'POST' | 'PUT' | 'DELETE',
	cookies: Cookies,
	uuid: string,
	request: Request,
	session?: Session | { accessToken?: string } | null,
	authSecret?: string
) {
	const accessToken = await resolveAccessToken(cookies, session, authSecret);
	if (!accessToken) {
		error(401, 'Unauthorized');
	}

	let body: string | undefined;
	if (method !== 'DELETE') {
		const jsonData = await request.json();
		const parsed = parseJson(jsonData, CreateReviewSchema);
		if (!parsed.success) {
			return json({ errors: parsed.errors }, { status: 400 });
		}
		body = JSON.stringify(parsed.data);
	}

	const headers = method === 'DELETE' ? authHeaders(accessToken) : jsonHeaders(accessToken);

	const res = await fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/reviews`, {
		method,
		headers,
		body
	});

	if (!res.ok) {
		error(res.status, 'Failed to submit review');
	}

	return json({ success: true });
}

export const POST: RequestHandler = async ({ params, cookies, request, locals, platform }) => {
	const session = await locals.auth();
	return forwardReviewRequest(
		'POST',
		cookies,
		params.uuid,
		request,
		session,
		platform?.env?.AUTH_SECRET
	);
};

export const PUT: RequestHandler = async ({ params, cookies, request, locals, platform }) => {
	const session = await locals.auth();
	return forwardReviewRequest(
		'PUT',
		cookies,
		params.uuid,
		request,
		session,
		platform?.env?.AUTH_SECRET
	);
};

export const DELETE: RequestHandler = async ({ params, cookies, request, locals, platform }) => {
	const session = await locals.auth();
	return forwardReviewRequest(
		'DELETE',
		cookies,
		params.uuid,
		request,
		session,
		platform?.env?.AUTH_SECRET
	);
};

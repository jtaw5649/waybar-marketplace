import type { PageServerLoad, Actions } from './$types';
import { API_BASE_URL } from '$lib';
import { fail, redirect } from '@sveltejs/kit';
import type { Module, UserProfile, Collection } from '$lib/types';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(
		event.cookies,
		session,
		event.platform?.env?.AUTH_SECRET
	);
	const validation = validateSession(session, !!accessToken);

	if (!session?.user || !validation.isValid || !accessToken) {
		return { session: toPublicSession(session), profile: null, modules: [], collections: [] };
	}

	if (validation.shouldReauth) {
		throw redirect(302, '/login');
	}

	const authHeader = acceptHeaders(accessToken);

	try {
		const [profileRes, modulesRes, collectionsRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/v1/users/me`, { headers: authHeader }),
			fetch(`${API_BASE_URL}/api/v1/modules/mine`, { headers: authHeader }),
			fetch(`${API_BASE_URL}/api/v1/collections`, { headers: authHeader })
		]);

		let profile: UserProfile | null = null;
		let modules: Module[] = [];
		let collections: Collection[] = [];

		if (profileRes.ok) {
			profile = await profileRes.json();
		}

		if (modulesRes.ok) {
			const data = await modulesRes.json();
			modules = data.modules || [];
		}

		if (collectionsRes.ok) {
			const data = await collectionsRes.json();
			collections = data.collections || [];
		}

		return { session: toPublicSession(session), profile, modules, collections };
	} catch {
		return { session: toPublicSession(session), profile: null, modules: [], collections: [] };
	}
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const formData = await event.request.formData();
		const display_name = formData.get('display_name') as string | null;
		const bio = formData.get('bio') as string | null;
		const website_url = formData.get('website_url') as string | null;

		const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
			method: 'PATCH',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({
				display_name: display_name || null,
				bio: bio || null,
				website_url: website_url || null
			})
		});

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to update profile' });
		}

		return { success: true };
	},

	createCollection: async (event) => {
		const session = await event.locals.auth();
		const accessToken = await resolveAccessToken(
			event.cookies,
			session,
			event.platform?.env?.AUTH_SECRET
		);
		if (!session?.user || !accessToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		if (session.error === 'RefreshTokenError') {
			return fail(401, { message: 'Session expired' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string | null;
		const visibility = (formData.get('visibility') as string) || 'private';

		if (!name || name.trim().length === 0) {
			return fail(400, { message: 'Collection name is required' });
		}

		const res = await fetch(`${API_BASE_URL}/api/v1/collections`, {
			method: 'POST',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({
				name: name.trim(),
				description: description?.trim() || null,
				visibility
			})
		});

		if (!res.ok) {
			const error = await res.text();
			return fail(res.status, { message: error || 'Failed to create collection' });
		}

		return { success: true };
	},

	updateCollection: async (event) => {
		const session = await event.locals.auth();
		const accessToken = await resolveAccessToken(
			event.cookies,
			session,
			event.platform?.env?.AUTH_SECRET
		);
		if (!session?.user || !accessToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		if (session.error === 'RefreshTokenError') {
			return fail(401, { message: 'Session expired' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string | null;
		const visibility = formData.get('visibility') as string;

		if (!id) {
			return fail(400, { message: 'Collection ID is required' });
		}

		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${id}`, {
			method: 'PATCH',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({
				name: name?.trim() || undefined,
				description: description?.trim() || null,
				visibility: visibility || undefined
			})
		});

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to update collection' });
		}

		return { success: true };
	},

	deleteCollection: async (event) => {
		const session = await event.locals.auth();
		const accessToken = await resolveAccessToken(
			event.cookies,
			session,
			event.platform?.env?.AUTH_SECRET
		);
		if (!session?.user || !accessToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		if (session.error === 'RefreshTokenError') {
			return fail(401, { message: 'Session expired' });
		}

		const formData = await event.request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'Collection ID is required' });
		}

		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${id}`, {
			method: 'DELETE',
			headers: acceptHeaders(accessToken)
		});

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to delete collection' });
		}

		return { success: true };
	}
};

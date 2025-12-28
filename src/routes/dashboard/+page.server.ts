import type { PageServerLoad, Actions } from './$types';
import { API_BASE_URL } from '$lib';
import { fail, redirect } from '@sveltejs/kit';
import type { Module, UserProfile, Collection } from '$lib/types';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';
import { parseFormData } from '$lib/server/formValidation';
import {
	CreateCollectionSchema,
	UpdateCollectionSchema,
	DeleteCollectionSchema
} from '$lib/schemas/collection';

async function fetchCollections(authHeader: HeadersInit): Promise<Collection[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/collections`, { headers: authHeader });
		if (!res.ok) return [];
		const data = await res.json();
		return data.collections || [];
	} catch {
		return [];
	}
}

export const load: PageServerLoad = async (event) => {
	const { isDataRequest } = event;
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
		const [profileRes, modulesRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/v1/users/me`, { headers: authHeader }),
			fetch(`${API_BASE_URL}/api/v1/modules/mine`, { headers: authHeader })
		]);

		let profile: UserProfile | null = null;
		let modules: Module[] = [];

		if (profileRes.ok) {
			profile = await profileRes.json();
		}

		if (modulesRes.ok) {
			const data = await modulesRes.json();
			modules = data.modules || [];
		}

		const collectionsPromise = fetchCollections(authHeader);

		return {
			session: toPublicSession(session),
			profile,
			modules,
			collections: isDataRequest ? await collectionsPromise : collectionsPromise
		};
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
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const formData = await event.request.formData();
		const parsed = parseFormData(formData, CreateCollectionSchema);

		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const { name, description, visibility } = parsed.data;

		const res = await fetch(`${API_BASE_URL}/api/v1/collections`, {
			method: 'POST',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({ name, description, visibility })
		});

		if (!res.ok) {
			const error = await res.text();
			return fail(res.status, { message: error || 'Failed to create collection' });
		}

		return { success: true };
	},

	updateCollection: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const formData = await event.request.formData();
		const parsed = parseFormData(formData, UpdateCollectionSchema);

		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const { id, name, description, visibility } = parsed.data;

		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${id}`, {
			method: 'PATCH',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({
				name: name || undefined,
				description,
				visibility: visibility || undefined
			})
		});

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to update collection' });
		}

		return { success: true };
	},

	deleteCollection: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const formData = await event.request.formData();
		const parsed = parseFormData(formData, DeleteCollectionSchema);

		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const { id } = parsed.data;

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

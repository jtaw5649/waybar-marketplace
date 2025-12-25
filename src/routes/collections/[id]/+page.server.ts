import type { PageServerLoad, Actions } from './$types';
import type { CollectionDetail } from '$lib/types';
import { API_BASE_URL } from '$lib';
import { error, fail } from '@sveltejs/kit';
import { normalizeUsername } from '$lib/utils/username';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { encodeModuleUuid } from '$lib/utils/url';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const collectionId = event.params.id;
	const accessToken = await resolveAccessToken(event.cookies);

	const headers = acceptHeaders(accessToken ?? undefined);

	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}`, { headers });

		if (!res.ok) {
			if (res.status === 404) {
				throw error(404, 'Collection not found');
			}
			if (res.status === 403) {
				throw error(403, 'You do not have permission to view this collection');
			}
			throw error(res.status, 'Failed to load collection');
		}

		const responseData = await res.json();
		const data = responseData.data || responseData;
		const collection: CollectionDetail = {
			...data.collection,
			modules: data.modules || []
		};
		const isOwner = normalizeUsername(session?.user?.login) === collection.owner?.username;

		return { session: toPublicSession(session), collection, isOwner };
	} catch (e) {
		if ((e as { status?: number }).status) {
			throw e;
		}
		throw error(500, 'Failed to load collection');
	}
};

export const actions: Actions = {
	removeModule: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const collectionId = event.params.id;
		const formData = await event.request.formData();
		const moduleUuid = formData.get('module_uuid') as string;

		if (!moduleUuid) {
			return fail(400, { message: 'Module UUID is required' });
		}

		const res = await fetch(
			`${API_BASE_URL}/api/v1/collections/${collectionId}/modules/${encodeModuleUuid(moduleUuid)}`,
			{
				method: 'DELETE',
				headers: acceptHeaders(accessToken)
			}
		);

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to remove module from collection' });
		}

		return { success: true };
	}
};

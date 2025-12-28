import type { PageServerLoad, Actions } from './$types';
import type { Module, Review, VersionHistoryEntry, CollectionBase, Screenshot } from '$lib/types';
import { error, fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { normalizeUsername } from '$lib/utils/username';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { encodeModuleUuid } from '$lib/utils/url';
import { acceptHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';
import { parseFormData } from '$lib/server/formValidation';
import {
	AddToCollectionSchema,
	UploadScreenshotSchema,
	DeleteScreenshotSchema
} from '$lib/schemas/module';

async function fetchReviews(fetchFn: typeof fetch, uuid: string): Promise<Review[]> {
	const res = await fetchFn(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/reviews`);
	if (!res.ok) return [];
	const data = await res.json();
	return data.data?.reviews || data.reviews || [];
}

async function fetchScreenshots(fetchFn: typeof fetch, uuid: string): Promise<Screenshot[]> {
	const res = await fetchFn(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/screenshots`);
	if (!res.ok) return [];
	const data = await res.json();
	return data.data?.screenshots || data.screenshots || [];
}

async function fetchRelatedModules(fetchFn: typeof fetch, uuid: string): Promise<Module[]> {
	const res = await fetchFn(
		`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/related?limit=6`
	);
	if (!res.ok) return [];
	const data = await res.json();
	return data.data?.modules || data.modules || [];
}

async function fetchCollections(accessToken: string): Promise<CollectionBase[]> {
	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/collections`, {
			headers: acceptHeaders(accessToken)
		});
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
	const uuid = event.params.uuid;
	const accessToken = await resolveAccessToken(
		event.cookies,
		session,
		event.platform?.env?.AUTH_SECRET
	);

	const [moduleRes, versionsRes] = await Promise.all([
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/versions`)
	]);

	if (!moduleRes.ok) {
		throw error(404, 'Module not found');
	}

	const moduleData = await moduleRes.json();
	const module: Module = moduleData.data || moduleData;

	let versions: VersionHistoryEntry[] = [];
	if (versionsRes.ok) {
		const versionsData = await versionsRes.json();
		versions = versionsData.data?.versions || versionsData.versions || [];
	}

	const reviewsPromise = fetchReviews(event.fetch, uuid);
	const screenshotsPromise = fetchScreenshots(event.fetch, uuid);
	const relatedPromise = fetchRelatedModules(event.fetch, uuid);
	const collectionsPromise = accessToken ? fetchCollections(accessToken) : Promise.resolve([]);

	const isOwner = normalizeUsername(session?.user?.login) === module.author;

	return {
		session: toPublicSession(session),
		uuid: module.uuid,
		module,
		versions,
		isOwner,
		reviews: isDataRequest ? await reviewsPromise : reviewsPromise,
		screenshots: isDataRequest ? await screenshotsPromise : screenshotsPromise,
		relatedModules: isDataRequest ? await relatedPromise : relatedPromise,
		collections: isDataRequest ? await collectionsPromise : collectionsPromise
	};
};

export const actions: Actions = {
	addToCollection: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const uuid = event.params.uuid;
		const formData = await event.request.formData();
		const parsed = parseFormData(formData, AddToCollectionSchema);

		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const { collection_id, note } = parsed.data;

		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${collection_id}/modules`, {
			method: 'POST',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({
				module_uuid: uuid,
				note: note?.trim() || null
			})
		});

		if (!res.ok) {
			const errorText = await res.text();
			if (errorText.includes('already in collection')) {
				return fail(400, { message: 'Module is already in this collection' });
			}
			return fail(res.status, { message: 'Failed to add module to collection' });
		}

		return { success: true };
	},

	uploadScreenshot: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const uuid = event.params.uuid;
		const formData = await event.request.formData();
		const file = formData.get('screenshot') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { message: 'No file provided' });
		}

		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			return fail(400, { message: 'File too large (max 10MB)' });
		}

		const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return fail(400, { message: 'Invalid file type. Use PNG, JPG, or WebP' });
		}

		const parsed = parseFormData(formData, UploadScreenshotSchema);
		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const { alt_text } = parsed.data;

		const endpoint = new URL(
			`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/screenshots`
		);
		const trimmedAlt = alt_text?.trim();
		if (trimmedAlt) {
			endpoint.searchParams.set('alt_text', trimmedAlt);
		}

		const res = await fetch(endpoint.toString(), {
			method: 'POST',
			headers: acceptHeaders(accessToken, { 'Content-Type': file.type }),
			body: new Uint8Array(await file.arrayBuffer())
		});

		if (!res.ok) {
			const errorText = await res.text();
			if (errorText.includes('Maximum')) {
				return fail(400, { message: 'Maximum 5 screenshots allowed' });
			}
			return fail(res.status, { message: 'Failed to upload screenshot' });
		}

		return { success: true };
	},

	deleteScreenshot: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const uuid = event.params.uuid;
		const formData = await event.request.formData();
		const parsed = parseFormData(formData, DeleteScreenshotSchema);

		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const { screenshot_id } = parsed.data;

		const res = await fetch(
			`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/screenshots/${screenshot_id}`,
			{
				method: 'DELETE',
				headers: acceptHeaders(accessToken)
			}
		);

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to delete screenshot' });
		}

		return { success: true };
	}
};

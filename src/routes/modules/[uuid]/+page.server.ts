import type { PageServerLoad, Actions } from './$types';
import type {
	Module,
	Review,
	VersionHistoryEntry,
	CollectionBase,
	Screenshot,
	RelatedModule
} from '$lib/types';
import { error, fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { normalizeUsername } from '$lib/utils/username';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { encodeModuleUuid } from '$lib/utils/url';
import { acceptHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const uuid = event.params.uuid;
	const accessToken = await resolveAccessToken(event.cookies);

	const [moduleRes, reviewsRes, versionsRes, screenshotsRes, relatedRes] = await Promise.all([
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/reviews`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/versions`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/screenshots`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/related?limit=6`)
	]);

	if (!moduleRes.ok) {
		throw error(404, 'Module not found');
	}

	const moduleData = await moduleRes.json();
	const module: Module = moduleData.data || moduleData;

	let reviews: Review[] = [];
	if (reviewsRes.ok) {
		const reviewsData = await reviewsRes.json();
		reviews = reviewsData.data?.reviews || reviewsData.reviews || [];
	}

	let versions: VersionHistoryEntry[] = [];
	if (versionsRes.ok) {
		const versionsData = await versionsRes.json();
		versions = versionsData.data?.versions || versionsData.versions || [];
	}

	let screenshots: Screenshot[] = [];
	if (screenshotsRes.ok) {
		const screenshotsData = await screenshotsRes.json();
		screenshots = screenshotsData.data?.screenshots || screenshotsData.screenshots || [];
	}

	let relatedModules: RelatedModule[] = [];
	if (relatedRes.ok) {
		const relatedData = await relatedRes.json();
		relatedModules = relatedData.data?.modules || relatedData.modules || [];
	}

	let collections: CollectionBase[] = [];
	if (accessToken) {
		try {
			const collectionsRes = await fetch(`${API_BASE_URL}/api/v1/collections`, {
				headers: acceptHeaders(accessToken)
			});
			if (collectionsRes.ok) {
				const collectionsData = await collectionsRes.json();
				collections = collectionsData.collections || [];
			}
		} catch (e) {
			console.error('Failed to fetch collections:', e);
		}
	}

	const isOwner = normalizeUsername(session?.user?.login) === module.author;

	return {
		session: toPublicSession(session),
		uuid: module.uuid,
		module,
		reviews,
		versions,
		screenshots,
		collections,
		relatedModules,
		isOwner
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
		const collectionId = formData.get('collection_id') as string;
		const note = formData.get('note') as string | null;

		if (!collectionId) {
			return fail(400, { message: 'Collection ID is required' });
		}

		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/modules`, {
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
		const altText = formData.get('alt_text') as string | null;

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

		const endpoint = new URL(
			`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/screenshots`
		);
		const trimmedAlt = altText?.trim();
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
		const screenshotId = formData.get('screenshot_id') as string;

		if (!screenshotId) {
			return fail(400, { message: 'Screenshot ID is required' });
		}

		const res = await fetch(
			`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/screenshots/${screenshotId}`,
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

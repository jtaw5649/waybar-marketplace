import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import type { Module } from '$lib/types';

interface ReviewUser {
	username: string;
	avatar_url: string | null;
}

interface Review {
	id: number;
	rating: number;
	title: string | null;
	body: string | null;
	helpful_count: number;
	created_at: string;
	updated_at: string | null;
	user: ReviewUser;
}

interface VersionHistoryEntry {
	version: string;
	changelog: string | null;
	downloads: number;
	published_at: string;
}

interface Collection {
	id: number;
	name: string;
	description: string | null;
	visibility: string;
	module_count: number;
}

interface Screenshot {
	id: number;
	r2_key: string;
	alt_text: string | null;
	position: number;
	created_at: string;
}

interface RelatedModule {
	uuid: string;
	name: string;
	author: string;
	description: string;
	category: string;
	downloads: number;
	verified_author: boolean;
	version?: string;
	created_at?: string;
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const uuid = event.params.uuid;

	const sessionToken =
		event.cookies.get('__Secure-authjs.session-token') || event.cookies.get('authjs.session-token');

	const [moduleRes, reviewsRes, versionsRes, screenshotsRes, indexRes] = await Promise.all([
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/reviews`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/versions`),
		event.fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/screenshots`),
		event.fetch(`${API_BASE_URL}/api/v1/index`)
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
	if (indexRes.ok) {
		const indexData = await indexRes.json();
		const allModules = (indexData.modules || []) as RelatedModule[];
		relatedModules = allModules
			.filter((m) => m.category === module.category && m.uuid !== uuid)
			.sort((a, b) => b.downloads - a.downloads)
			.slice(0, 6);
	}

	let collections: Collection[] = [];
	if (session?.user && sessionToken) {
		try {
			const collectionsRes = await fetch(`${API_BASE_URL}/api/v1/collections`, {
				headers: { Cookie: `authjs.session-token=${sessionToken}` }
			});
			if (collectionsRes.ok) {
				const collectionsData = await collectionsRes.json();
				collections = collectionsData.collections || [];
			}
		} catch (e) {
			console.error('Failed to fetch collections:', e);
		}
	}

	const isOwner = session?.user?.name === module.author;

	return {
		session,
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
		const session = await event.locals.auth();
		if (!session?.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const sessionToken =
			event.cookies.get('__Secure-authjs.session-token') ||
			event.cookies.get('authjs.session-token');
		if (!sessionToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		const uuid = event.params.uuid;
		const formData = await event.request.formData();
		const collectionId = formData.get('collection_id') as string;
		const note = formData.get('note') as string | null;

		if (!collectionId) {
			return fail(400, { message: 'Collection ID is required' });
		}

		const res = await fetch(`${API_BASE_URL}/api/v1/collections/${collectionId}/modules`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `authjs.session-token=${sessionToken}`
			},
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
		const session = await event.locals.auth();
		if (!session?.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const sessionToken =
			event.cookies.get('__Secure-authjs.session-token') ||
			event.cookies.get('authjs.session-token');
		if (!sessionToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		const uuid = event.params.uuid;
		const formData = await event.request.formData();
		const file = formData.get('screenshot') as File | null;
		const altText = formData.get('alt_text') as string | null;

		if (!file || file.size === 0) {
			return fail(400, { message: 'No file provided' });
		}

		if (file.size > 2 * 1024 * 1024) {
			return fail(400, { message: 'File too large (max 2MB)' });
		}

		const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return fail(400, { message: 'Invalid file type. Use PNG, JPG, or WebP' });
		}

		const apiFormData = new FormData();
		apiFormData.append('file', file);
		if (altText?.trim()) {
			apiFormData.append('alt_text', altText.trim());
		}

		const res = await fetch(
			`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/screenshots`,
			{
				method: 'POST',
				headers: {
					Cookie: `authjs.session-token=${sessionToken}`
				},
				body: apiFormData
			}
		);

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
		const session = await event.locals.auth();
		if (!session?.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const sessionToken =
			event.cookies.get('__Secure-authjs.session-token') ||
			event.cookies.get('authjs.session-token');
		if (!sessionToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		const uuid = event.params.uuid;
		const formData = await event.request.formData();
		const screenshotId = formData.get('screenshot_id') as string;

		if (!screenshotId) {
			return fail(400, { message: 'Screenshot ID is required' });
		}

		const res = await fetch(
			`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/screenshots/${screenshotId}`,
			{
				method: 'DELETE',
				headers: {
					Cookie: `authjs.session-token=${sessionToken}`
				}
			}
		);

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to delete screenshot' });
		}

		return { success: true };
	}
};

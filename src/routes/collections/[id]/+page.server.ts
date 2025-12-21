import type { PageServerLoad, Actions } from './$types';
import { API_BASE_URL } from '$lib';
import { error, fail } from '@sveltejs/kit';
import { normalizeUsername } from '$lib/utils/username';

interface CollectionModule {
	uuid: string;
	name: string;
	author: string;
	category: string;
	note: string | null;
	position: number;
	added_at: string;
}

interface Collection {
	id: number;
	name: string;
	description: string | null;
	visibility: 'private' | 'public' | 'unlisted';
	module_count: number;
	modules: CollectionModule[];
	owner: {
		username: string;
		display_name: string | null;
		avatar_url: string | null;
	};
	created_at: string;
	updated_at: string;
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const collectionId = event.params.id;
	const accessToken = session?.accessToken;

	const headers: Record<string, string> = {};
	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`;
	}

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

		const collection: Collection = await res.json();
		const isOwner = normalizeUsername(session?.user?.login) === collection.owner?.username;

		return { session, collection, isOwner };
	} catch (e) {
		if ((e as { status?: number }).status) {
			throw e;
		}
		throw error(500, 'Failed to load collection');
	}
};

export const actions: Actions = {
	removeModule: async (event) => {
		const session = await event.locals.auth();
		const accessToken = session?.accessToken;
		if (!session?.user || !accessToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		const collectionId = event.params.id;
		const formData = await event.request.formData();
		const moduleUuid = formData.get('module_uuid') as string;

		if (!moduleUuid) {
			return fail(400, { message: 'Module UUID is required' });
		}

		const res = await fetch(
			`${API_BASE_URL}/api/v1/collections/${collectionId}/modules/${encodeURIComponent(moduleUuid)}`,
			{
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to remove module from collection' });
		}

		return { success: true };
	}
};

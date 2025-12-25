import type { PageServerLoad } from './$types';
import type { Module, UserProfile, CollectionBase } from '$lib/types';
import { error } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { toPublicSession } from '$lib/utils/sessionPublic';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const username = event.params.username;

	const profileRes = await event.fetch(`${API_BASE_URL}/api/v1/users/${username}`);

	if (!profileRes.ok) {
		if (profileRes.status === 404) {
			throw error(404, 'User not found');
		}
		throw error(500, 'Failed to fetch user profile');
	}

	const profile: UserProfile = await profileRes.json();

	let modules: Module[] = [];
	const modulesRes = await event.fetch(`${API_BASE_URL}/api/v1/users/${username}/modules`);
	if (modulesRes.ok) {
		const modulesData = await modulesRes.json();
		modules = modulesData.modules || [];
	}

	let collections: CollectionBase[] = [];
	const collectionsRes = await event.fetch(
		`${API_BASE_URL}/api/v1/users/${username}/collections?visibility=public`
	);
	if (collectionsRes.ok) {
		const collectionsData = await collectionsRes.json();
		collections = collectionsData.collections || [];
	}

	const totalDownloads = modules.reduce((sum, m) => sum + m.downloads, 0);

	return {
		session: toPublicSession(session),
		profile,
		modules,
		collections,
		totalDownloads
	};
};

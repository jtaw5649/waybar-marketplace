import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import type { Module } from '$lib/types';

interface UserProfile {
	id: number;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	website_url: string | null;
	github_url: string | null;
	twitter_url: string | null;
	mastodon_url: string | null;
	verified_author: boolean;
	module_count: number;
	created_at: string;
}

interface Collection {
	id: number;
	name: string;
	description: string | null;
	visibility: 'public' | 'unlisted' | 'private';
	module_count: number;
	created_at: string;
}

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

	let collections: Collection[] = [];
	const collectionsRes = await event.fetch(
		`${API_BASE_URL}/api/v1/users/${username}/collections?visibility=public`
	);
	if (collectionsRes.ok) {
		const collectionsData = await collectionsRes.json();
		collections = collectionsData.collections || [];
	}

	const totalDownloads = modules.reduce((sum, m) => sum + m.downloads, 0);

	return {
		session,
		profile,
		modules,
		collections,
		totalDownloads
	};
};

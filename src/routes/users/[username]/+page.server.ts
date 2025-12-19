import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';

interface UserProfile {
	id: number;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	website_url: string | null;
	verified_author: boolean;
	module_count: number;
	created_at: string;
}

interface Module {
	uuid: string;
	name: string;
	author: string;
	description: string;
	category: string;
	downloads: number;
	rating: number | null;
	verified_author: boolean;
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const username = event.params.username;

	const profileRes = await event.fetch(`${API_BASE_URL}/api/v1/users/${username}`);

	if (!profileRes.ok) {
		if (profileRes.status === 404) {
			error(404, 'User not found');
		}
		error(500, 'Failed to fetch user profile');
	}

	const profile: UserProfile = await profileRes.json();

	let modules: Module[] = [];
	const modulesRes = await event.fetch(`${API_BASE_URL}/api/v1/users/${username}/modules`);
	if (modulesRes.ok) {
		const modulesData = await modulesRes.json();
		modules = modulesData.modules || [];
	}

	return {
		session,
		profile,
		modules
	};
};

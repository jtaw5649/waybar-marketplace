import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import type { Module } from '$lib/types';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';

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

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const validation = validateSession(session);

	if (!session?.user || validation.shouldReauth) {
		throw redirect(302, '/login');
	}

	const authHeader = { Authorization: `Bearer ${session.accessToken}` };

	let profile: UserProfile | null = null;
	let modules: Module[] = [];

	try {
		const [profileRes, modulesRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/v1/users/me`, { headers: authHeader }),
			fetch(`${API_BASE_URL}/api/v1/modules/mine`, { headers: authHeader })
		]);

		if (profileRes.ok) {
			profile = await profileRes.json();
		}

		if (modulesRes.ok) {
			const data = await modulesRes.json();
			modules = data.modules || [];
		}
	} catch (e) {
		console.error('Failed to fetch user data:', e);
	}

	return { session: toPublicSession(session), profile, modules };
};

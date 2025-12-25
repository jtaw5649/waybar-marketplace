import type { LayoutServerLoad } from './$types';
import type { Module, UserProfile } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(event.cookies);
	const validation = validateSession(session, !!accessToken);

	if (!session?.user || validation.shouldReauth || !accessToken) {
		throw redirect(302, '/login');
	}

	const authHeader = acceptHeaders(accessToken);

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

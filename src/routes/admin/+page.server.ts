import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { validateSession } from '$lib/utils/sessionValidator';

interface UserProfile {
	role: 'user' | 'moderator' | 'admin';
}

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const validation = validateSession(session);

	if (!session?.user || validation.shouldReauth) {
		throw redirect(302, '/login?redirectTo=/admin');
	}

	const res = await event.fetch(`${API_BASE_URL}/api/v1/users/me`, {
		headers: { Authorization: `Bearer ${session.accessToken}` }
	});

	if (!res.ok) {
		throw error(403, 'Access denied. Could not verify permissions.');
	}

	const profile: UserProfile = await res.json();

	if (profile.role !== 'admin') {
		throw error(403, 'Access denied. Admin privileges required.');
	}

	return { session };
};

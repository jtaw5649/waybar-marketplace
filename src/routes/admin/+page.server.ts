import type { PageServerLoad } from './$types';
import type { UserProfile } from '$lib/types';
import { redirect, error } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(event.cookies);
	const validation = validateSession(session, !!accessToken);

	if (!session?.user || validation.shouldReauth || !accessToken) {
		throw redirect(302, '/login?redirectTo=/admin');
	}

	const headers = acceptHeaders(accessToken);

	const meRes = await event.fetch(`${API_BASE_URL}/api/v1/users/me`, { headers });

	if (!meRes.ok) {
		throw error(403, 'Access denied. Could not verify permissions.');
	}

	const profile: UserProfile = await meRes.json();

	if (profile.role !== 'admin' && profile.role !== 'moderator') {
		throw error(403, 'Access denied. Admin privileges required.');
	}

	const [submissionsRes, statsRes] = await Promise.all([
		event.fetch(`${API_BASE_URL}/api/v1/admin/submissions`, { headers }),
		event.fetch(`${API_BASE_URL}/api/v1/admin/stats`, { headers })
	]);

	if (!submissionsRes.ok || !statsRes.ok) {
		throw error(500, 'Failed to fetch admin data');
	}

	const [submissionsData, statsData] = await Promise.all([submissionsRes.json(), statsRes.json()]);

	return {
		session: toPublicSession(session),
		submissions: submissionsData.data || [],
		stats: statsData.data || null
	};
};

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

	const headers = { Authorization: `Bearer ${session.accessToken}` };

	const meRes = await event.fetch(`${API_BASE_URL}/api/v1/users/me`, { headers });

	if (!meRes.ok) {
		throw error(403, 'Access denied. Could not verify permissions.');
	}

	const profile: UserProfile = await meRes.json();

	if (profile.role !== 'admin') {
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
		session,
		submissions: submissionsData.data || [],
		stats: statsData.data || null
	};
};

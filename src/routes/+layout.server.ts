import type { LayoutServerLoad } from './$types';
import type { UserProfile } from '$lib/types';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { API_BASE_URL } from '$lib';

async function syncUser(accessToken: string): Promise<void> {
	try {
		await fetch(`${API_BASE_URL}/api/v1/auth/sync`, {
			method: 'POST',
			headers: acceptHeaders(accessToken)
		});
	} catch (error) {
		void error;
	}
}

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(
		event.cookies,
		undefined,
		event.platform?.env?.AUTH_SECRET
	);

	let isAdmin = false;
	let userProfile: UserProfile | null = null;

	if (session?.user && accessToken) {
		try {
			await syncUser(accessToken);
			const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
				headers: acceptHeaders(accessToken)
			});
			if (res.ok) {
				userProfile = await res.json();
				isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'moderator';
			}
		} catch {
			isAdmin = false;
		}
	} else {
		event.cookies.delete('profile_cache', { path: '/' });
	}

	return { session: toPublicSession(session), isAdmin, userProfile };
};

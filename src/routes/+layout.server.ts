import type { LayoutServerLoad } from './$types';
import type { UserProfile } from '$lib/types';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import { API_BASE_URL } from '$lib';

const PROFILE_CACHE_TTL_MS = 300000;

interface CachedProfile {
	isAdmin: boolean;
	timestamp: number;
}

function getCachedProfile(cookies: {
	get: (name: string) => string | undefined;
}): CachedProfile | null {
	const cached = cookies.get('profile_cache');
	if (!cached) return null;
	try {
		const parsed: CachedProfile = JSON.parse(cached);
		if (Date.now() - parsed.timestamp < PROFILE_CACHE_TTL_MS) {
			return parsed;
		}
	} catch {
		return null;
	}
	return null;
}

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(event.cookies);

	let isAdmin = false;
	let userProfile: UserProfile | null = null;

	if (session?.user && accessToken) {
		const cached = getCachedProfile(event.cookies);
		if (cached) {
			isAdmin = cached.isAdmin;
		} else {
			try {
				const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
					headers: acceptHeaders(accessToken)
				});
				if (res.ok) {
					userProfile = await res.json();
					isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'moderator';
					event.cookies.set(
						'profile_cache',
						JSON.stringify({
							isAdmin,
							timestamp: Date.now()
						}),
						{
							path: '/',
							httpOnly: true,
							sameSite: 'lax',
							maxAge: PROFILE_CACHE_TTL_MS / 1000
						}
					);
				}
			} catch {
				isAdmin = false;
			}
		}
	} else {
		event.cookies.delete('profile_cache', { path: '/' });
	}

	return { session: toPublicSession(session), isAdmin, userProfile };
};

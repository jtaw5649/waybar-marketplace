import type { PageServerLoad } from './$types';
import { API_BASE_URL } from '$lib';
import { normalizeStarsPayload } from '$lib/utils/starsResponse';
import { isStarredModule } from '$lib/utils/moduleGuards';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { acceptHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';
import type { StarredModule } from '$lib/types';

export const load: PageServerLoad = async ({ locals, cookies, platform }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, undefined, platform?.env?.AUTH_SECRET);
	const publicSession = toPublicSession(session);
	const validation = validateSession(session, !!accessToken);

	if (!validation.isValid || !accessToken) {
		return {
			starredModules: [] as StarredModule[],
			total: 0,
			isAuthenticated: false,
			session: publicSession
		};
	}

	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/users/me/stars`, {
			headers: acceptHeaders(accessToken)
		});

		if (!res.ok) {
			return {
				starredModules: [] as StarredModule[],
				total: 0,
				isAuthenticated: true,
				session: publicSession
			};
		}

		const payload = normalizeStarsPayload<StarredModule>(await res.json(), isStarredModule);

		return {
			starredModules: payload.modules,
			total: payload.total,
			isAuthenticated: true,
			session: publicSession
		};
	} catch {
		return {
			starredModules: [] as StarredModule[],
			total: 0,
			isAuthenticated: true,
			session: publicSession
		};
	}
};

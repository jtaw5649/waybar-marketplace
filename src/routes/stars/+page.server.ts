import type { PageServerLoad } from './$types';
import { API_BASE_URL } from '$lib';
import { normalizeStarsPayload } from '$lib/utils/starsResponse';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';

interface StarredModule {
	uuid: string;
	name: string;
	slug: string;
	description: string;
	category: string;
	downloads: number;
	version?: string;
	verified: boolean;
	icon_url?: string;
	author_username: string;
	created_at: string;
	starred_at: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const publicSession = toPublicSession(session);
	const validation = validateSession(session);

	if (!validation.isValid || !session?.accessToken) {
		return {
			starredModules: [] as StarredModule[],
			total: 0,
			isAuthenticated: false,
			session: publicSession
		};
	}

	try {
		const res = await fetch(`${API_BASE_URL}/api/v1/users/me/stars`, {
			headers: {
				Authorization: `Bearer ${session.accessToken}`
			}
		});

		if (!res.ok) {
			return {
				starredModules: [] as StarredModule[],
				total: 0,
				isAuthenticated: true,
				session: publicSession
			};
		}

		const payload = normalizeStarsPayload<StarredModule>(await res.json());

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

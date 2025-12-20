import type { PageServerLoad } from './$types';
import { API_BASE_URL } from '$lib';
import { validateSession } from '$lib/utils/sessionValidator';

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

interface StarsResponse {
	data: {
		modules: StarredModule[];
		total: number;
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	const validation = validateSession(session);

	if (!validation.isValid || !session?.accessToken) {
		return {
			starredModules: [] as StarredModule[],
			total: 0,
			isAuthenticated: false,
			session: session ?? null
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
				session
			};
		}

		const data: StarsResponse = await res.json();

		return {
			starredModules: data.data.modules,
			total: data.data.total,
			isAuthenticated: true,
			session
		};
	} catch {
		return {
			starredModules: [] as StarredModule[],
			total: 0,
			isAuthenticated: true,
			session
		};
	}
};

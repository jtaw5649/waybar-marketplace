import { error } from '@sveltejs/kit';
import type { Session } from '@auth/sveltekit';
import type { Cookies } from '@sveltejs/kit';
import { resolveAccessToken } from '$lib/server/token';

export async function requireAccessToken(
	cookies?: Cookies,
	session?: Session | { accessToken?: string } | null,
	authSecret?: string
): Promise<string> {
	const token = await resolveAccessToken(cookies, session, authSecret);
	if (!token) {
		error(401, 'Unauthorized');
	}
	return token;
}

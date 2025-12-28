import { fail, type RequestEvent } from '@sveltejs/kit';
import { resolveAccessToken } from '$lib/server/token';
import type { Session } from '@auth/sveltekit';

interface AuthenticatedSession extends Session {
	user: NonNullable<Session['user']>;
}

export async function requireAuthenticatedAction(event: RequestEvent) {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(
		event.cookies,
		undefined,
		event.platform?.env?.AUTH_SECRET
	);

	if (!session?.user || !accessToken) {
		return fail(401, { message: 'Unauthorized' });
	}

	if (session.error === 'RefreshTokenError') {
		return fail(401, { message: 'Session expired' });
	}

	return { session: session as AuthenticatedSession, accessToken };
}

export function isAuthFailure(result: unknown): result is ReturnType<typeof fail> {
	return result !== null && typeof result === 'object' && 'status' in result;
}

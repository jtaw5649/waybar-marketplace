import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { resolveAccessToken } from '$lib/server/token';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const accessToken = await resolveAccessToken(event.cookies, session);
	const validation = validateSession(session, !!accessToken);

	if (session?.user && validation.isValid) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		const safeRedirect =
			redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
		throw redirect(303, safeRedirect);
	}

	return { session: toPublicSession(session) };
};

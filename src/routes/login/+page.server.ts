import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateSession } from '$lib/utils/sessionValidator';
import { toPublicSession } from '$lib/utils/sessionPublic';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const validation = validateSession(session);

	if (session?.user && validation.isValid) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		const safeRedirect =
			redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
		throw redirect(303, safeRedirect);
	}

	return { session: toPublicSession(session) };
};

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateSession } from '$lib/utils/sessionValidator';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const validation = validateSession(session);

	if (session?.user && validation.isValid) {
		const redirectTo = event.url.searchParams.get('redirectTo') || '/';
		throw redirect(303, redirectTo);
	}

	return { session };
};

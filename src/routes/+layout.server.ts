import type { LayoutServerLoad } from './$types';
import { toPublicSession } from '$lib/utils/sessionPublic';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	return { session: toPublicSession(session) };
};

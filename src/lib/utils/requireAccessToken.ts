import { error } from '@sveltejs/kit';

export async function requireAccessToken(locals: App.Locals): Promise<string> {
	const session = await locals.auth();
	if (!session?.accessToken) {
		error(401, 'Unauthorized');
	}
	return session.accessToken;
}

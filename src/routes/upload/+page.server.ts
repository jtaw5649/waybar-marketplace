import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { API_BASE_URL } from '$lib';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) {
		throw redirect(302, '/login');
	}
	return { session };
};

export const actions: Actions = {
	upload: async (event) => {
		const session = await event.locals.auth();
		if (!session?.user) return fail(401, { message: 'Unauthorized' });

		const sessionToken =
			event.cookies.get('__Secure-authjs.session-token') ||
			event.cookies.get('authjs.session-token');
		if (!sessionToken) return fail(401, { message: 'Session expired' });

		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const category = formData.get('category') as string;
		const version = formData.get('version') as string;
		const repoUrl = formData.get('repo_url') as string;
		const changelog = formData.get('changelog') as string;
		const packageFile = formData.get('package') as File;

		if (!name || !description || !category || !version || !packageFile) {
			return fail(400, { message: 'Missing required fields' });
		}

		const author = session.user.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'anonymous';
		const moduleName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
		const uuid = `${moduleName}@${author}`;
		const cookieHeader = `authjs.session-token=${sessionToken}`;

		try {
			const createRes = await fetch(`${API_BASE_URL}/api/v1/modules`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
				body: JSON.stringify({ uuid, name, description, category, repo_url: repoUrl })
			});
			if (!createRes.ok) {
				return fail(createRes.status, {
					message: (await createRes.text()) || 'Failed to create module'
				});
			}

			const uploadRes = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/versions/${version}/upload`,
				{ method: 'POST', headers: { Cookie: cookieHeader }, body: await packageFile.arrayBuffer() }
			);
			if (!uploadRes.ok) {
				return fail(uploadRes.status, {
					message: (await uploadRes.text()) || 'Failed to upload package'
				});
			}

			const publishRes = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/versions/${version}/publish`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
					body: JSON.stringify({ changelog: changelog || null })
				}
			);
			if (!publishRes.ok) {
				return fail(publishRes.status, {
					message: (await publishRes.text()) || 'Failed to publish'
				});
			}

			return { success: true, uuid };
		} catch {
			return fail(500, { message: 'Unable to connect to server' });
		}
	}
};

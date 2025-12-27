import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { API_BASE_URL } from '$lib';
import {
	ALLOWED_PACKAGE_EXTENSIONS,
	isAllowedPackageExtension,
	isPackageSizeAllowed
} from '$lib/utils/packageValidation';
import { toPublicSession } from '$lib/utils/sessionPublic';
import { encodeModuleUuid } from '$lib/utils/url';
import { acceptHeaders, jsonHeaders } from '$lib/server/authHeaders';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) {
		throw redirect(302, '/login');
	}
	if (session.error === 'RefreshTokenError') {
		throw redirect(302, '/login');
	}
	return {
		session: toPublicSession(session),
		turnstileSiteKey: event.platform?.env?.TURNSTILE_SITE_KEY
	};
};

export const actions: Actions = {
	upload: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { session, accessToken } = authResult;

		const formData = await event.request.formData();

		const turnstileSecret = event.platform?.env?.TURNSTILE_SECRET;
		if (turnstileSecret) {
			const turnstileToken = formData.get('cf-turnstile-response') as string;
			if (!turnstileToken) {
				return fail(400, { message: 'Bot verification required' });
			}

			const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					secret: turnstileSecret,
					response: turnstileToken
				})
			});
			const verifyResult = await verifyRes.json().catch(() => null);
			if (
				!verifyResult ||
				typeof verifyResult !== 'object' ||
				(verifyResult as { success?: boolean }).success !== true
			) {
				return fail(400, { message: 'Bot verification failed' });
			}
		}

		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const category = formData.get('category') as string;
		const version = formData.get('version') as string;
		const license = formData.get('license') as string;
		const repoUrl = formData.get('repo_url') as string;
		const changelog = formData.get('changelog') as string;
		const packageFile = formData.get('package') as File;

		if (!name || !description || !category || !version || !license || !packageFile) {
			return fail(400, { message: 'Missing required fields' });
		}

		if (!isAllowedPackageExtension(packageFile.name)) {
			return fail(400, {
				message: `File must be one of: ${ALLOWED_PACKAGE_EXTENSIONS.join(', ')}`
			});
		}

		if (!isPackageSizeAllowed(packageFile.size)) {
			return fail(400, {
				message: `File size must be less than 10MB (current: ${(
					packageFile.size /
					1024 /
					1024
				).toFixed(1)}MB)`
			});
		}

		const author = session.user.login?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'anonymous';
		const moduleName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
		const uuid = `${moduleName}@${author}`;
		const authHeader = acceptHeaders(accessToken);

		try {
			const createRes = await fetch(`${API_BASE_URL}/api/v1/modules`, {
				method: 'POST',
				headers: jsonHeaders(accessToken),
				body: JSON.stringify({
					uuid,
					name,
					description,
					category,
					repo_url: repoUrl,
					license
				})
			});
			if (!createRes.ok) {
				return fail(createRes.status, { message: 'Failed to create module' });
			}

			const uploadRes = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/versions/${version}/upload`,
				{ method: 'POST', headers: authHeader, body: await packageFile.arrayBuffer() }
			);
			if (!uploadRes.ok) {
				return fail(uploadRes.status, { message: 'Failed to upload package' });
			}

			const publishRes = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeModuleUuid(uuid)}/versions/${version}/publish`,
				{
					method: 'POST',
					headers: jsonHeaders(accessToken),
					body: JSON.stringify({ changelog: changelog || null })
				}
			);
			if (!publishRes.ok) {
				return fail(publishRes.status, { message: 'Failed to publish' });
			}

			return { success: true, uuid };
		} catch {
			return fail(500, { message: 'Unable to connect to server' });
		}
	}
};

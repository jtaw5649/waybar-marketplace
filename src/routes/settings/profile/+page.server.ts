import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { jsonHeaders } from '$lib/server/authHeaders';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';
import { parseFormData } from '$lib/server/formValidation';
import { UpdateProfileSchema } from '$lib/schemas/user';

export const actions: Actions = {
	updateProfile: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const formData = await event.request.formData();
		const parsed = parseFormData(formData, UpdateProfileSchema);

		if (!parsed.success) {
			return fail(400, { errors: parsed.errors });
		}

		const {
			display_name,
			bio,
			website_url,
			github_url,
			twitter_url,
			bluesky_url,
			discord_url,
			sponsor_url
		} = parsed.data;

		const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
			method: 'PATCH',
			headers: jsonHeaders(accessToken),
			body: JSON.stringify({
				display_name: display_name || null,
				bio: bio || null,
				website_url: website_url || null,
				github_url: github_url || null,
				twitter_url: twitter_url || null,
				bluesky_url: bluesky_url || null,
				discord_url: discord_url || null,
				sponsor_url: sponsor_url || null
			})
		});

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to update profile' });
		}

		return { success: true };
	}
};

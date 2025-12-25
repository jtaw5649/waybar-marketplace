import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { jsonHeaders } from '$lib/server/authHeaders';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';

export const actions: Actions = {
	updateProfile: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { accessToken } = authResult;

		const formData = await event.request.formData();
		const display_name = formData.get('display_name') as string | null;
		const bio = formData.get('bio') as string | null;
		const website_url = formData.get('website_url') as string | null;
		const github_url = formData.get('github_url') as string | null;
		const twitter_url = formData.get('twitter_url') as string | null;
		const bluesky_url = formData.get('bluesky_url') as string | null;
		const discord_url = formData.get('discord_url') as string | null;
		const sponsor_url = formData.get('sponsor_url') as string | null;

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

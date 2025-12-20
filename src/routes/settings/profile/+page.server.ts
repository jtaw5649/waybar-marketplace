import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';

export const actions: Actions = {
	updateProfile: async (event) => {
		const session = await event.locals.auth();
		if (!session?.user || !session.accessToken) {
			return fail(401, { message: 'Unauthorized' });
		}

		if (session.error === 'RefreshTokenError') {
			return fail(401, { message: 'Session expired' });
		}

		const formData = await event.request.formData();
		const display_name = formData.get('display_name') as string | null;
		const bio = formData.get('bio') as string | null;
		const website_url = formData.get('website_url') as string | null;

		const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${session.accessToken}`
			},
			body: JSON.stringify({
				display_name: display_name || null,
				bio: bio || null,
				website_url: website_url || null
			})
		});

		if (!res.ok) {
			return fail(res.status, { message: 'Failed to update profile' });
		}

		return { success: true };
	}
};

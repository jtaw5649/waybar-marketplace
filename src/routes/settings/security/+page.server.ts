import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { API_BASE_URL } from '$lib';
import { acceptHeaders } from '$lib/server/authHeaders';
import { requireAuthenticatedAction, isAuthFailure } from '$lib/server/authAction';
import { Resend } from 'resend';

interface UserProfile {
	username: string;
	display_name: string | null;
	bio: string | null;
	website_url: string | null;
	created_at: string;
}

interface Module {
	uuid: string;
	name: string;
	description: string;
	category: string;
	version?: string;
}

interface ExportData {
	exportedAt: string;
	profile: UserProfile | null;
	modules: Module[];
	stars: Module[];
}

export const actions: Actions = {
	exportData: async (event) => {
		const authResult = await requireAuthenticatedAction(event);
		if (isAuthFailure(authResult)) {
			return authResult;
		}
		const { session, accessToken } = authResult;

		const email = session.user.email;
		if (!email) {
			return fail(400, { message: 'No email address associated with your account' });
		}

		const resendApiKey = event.platform?.env?.RESEND_API_KEY;
		if (!resendApiKey) {
			return fail(500, { message: 'Email service not configured' });
		}

		const headers = acceptHeaders(accessToken);

		const [profileRes, modulesRes, starsRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/v1/users/me`, { headers }),
			fetch(`${API_BASE_URL}/api/v1/modules/mine`, { headers }),
			fetch(`${API_BASE_URL}/api/v1/users/me/stars`, { headers })
		]);

		const exportData: ExportData = {
			exportedAt: new Date().toISOString(),
			profile: profileRes.ok ? await profileRes.json() : null,
			modules: modulesRes.ok ? await modulesRes.json() : [],
			stars: starsRes.ok ? await starsRes.json() : []
		};

		const resend = new Resend(resendApiKey);
		const jsonContent = JSON.stringify(exportData, null, 2);
		const date = new Date().toISOString().split('T')[0];

		const { error } = await resend.emails.send({
			from: 'Barforge <noreply@barforge.dev>',
			to: email,
			subject: 'Your Barforge Data Export',
			html: `
				<h1>Your Barforge Data Export</h1>
				<p>Hello ${session.user.name || session.user.login || 'there'},</p>
				<p>Here is your requested data export from Barforge.</p>
				<h2>Summary</h2>
				<ul>
					<li><strong>Modules:</strong> ${exportData.modules.length}</li>
					<li><strong>Starred:</strong> ${exportData.stars.length}</li>
				</ul>
				<p>Your complete data is attached as a JSON file.</p>
				<p>— The Barforge Team</p>
			`,
			attachments: [
				{
					filename: `barforge-export-${date}.json`,
					content: Buffer.from(jsonContent).toString('base64')
				}
			]
		});

		if (error) {
			console.error('Failed to send export email:', error);
			return fail(500, { message: 'Failed to send export email' });
		}

		return { success: true };
	}
};

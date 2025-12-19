import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [GitHub],
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				return {
					...token,
					accessToken: account.access_token,
					expiresAt: account.expires_at,
					refreshToken: account.refresh_token,
					login: (profile as { login?: string })?.login
				};
			}

			if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
				return token;
			}

			if (token.refreshToken) {
				return refreshAccessToken(token);
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? '';
				session.user.login = token.login as string | undefined;
			}
			session.accessToken = token.accessToken as string | undefined;
			session.error = token.error as string | undefined;
			return session;
		}
	},
	trustHost: true
});

async function refreshAccessToken(token: Record<string, unknown>) {
	try {
		const response = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			},
			body: new URLSearchParams({
				client_id: env.AUTH_GITHUB_ID ?? '',
				client_secret: env.AUTH_GITHUB_SECRET ?? '',
				grant_type: 'refresh_token',
				refresh_token: token.refreshToken as string
			})
		});

		const tokens = await response.json();

		if (!response.ok) throw tokens;

		return {
			...token,
			accessToken: tokens.access_token,
			expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
			refreshToken: tokens.refresh_token ?? token.refreshToken
		};
	} catch (error) {
		console.error('Error refreshing token:', error);
		return { ...token, error: 'RefreshTokenError' };
	}
}

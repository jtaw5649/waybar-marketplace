import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import type { JWT } from '@auth/core/jwt';
import type { Account, Profile, Session } from '@auth/core/types';
import { env } from '$env/dynamic/private';

type Token = JWT & {
	accessToken?: string;
	expiresAt?: number;
	refreshToken?: string;
	login?: string;
	error?: string;
};

type JwtCallbackParams = {
	token: Token;
	account?: Account | null;
	profile?: Profile;
};

type SessionWithExtras = Session & {
	accessToken?: string;
	error?: string;
};

type SessionCallbackParams = {
	session: SessionWithExtras;
	token: Token;
};

export async function authJwtCallback({
	token,
	account,
	profile
}: JwtCallbackParams): Promise<Token> {
	if (account) {
		const accessToken = typeof account.access_token === 'string' ? account.access_token : undefined;
		const expiresAt = typeof account.expires_at === 'number' ? account.expires_at : undefined;
		const refreshToken =
			typeof account.refresh_token === 'string' ? account.refresh_token : undefined;
		const login = typeof profile?.login === 'string' ? profile.login : undefined;

		return {
			...token,
			accessToken,
			expiresAt,
			refreshToken,
			login,
			error: undefined
		};
	}

	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	const expiresAt = typeof token.expiresAt === 'number' ? token.expiresAt : null;

	if (expiresAt && Date.now() < expiresAt * 1000 - FIVE_MINUTES_MS) {
		return token;
	}

	if (expiresAt && token.refreshToken) {
		return refreshAccessToken(token);
	}

	if (expiresAt) {
		return { ...token, error: 'RefreshTokenError', accessToken: undefined };
	}

	return token;
}

export async function authSessionCallback({ session, token }: SessionCallbackParams) {
	if (session.user) {
		session.user.id = typeof token.sub === 'string' ? token.sub : '';
		session.user.login = typeof token.login === 'string' ? token.login : undefined;
	}
	session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
	session.error = typeof token.error === 'string' ? token.error : undefined;
	return session;
}

export function resolveTrustHost(nodeEnv?: string, trustHostEnv?: string): boolean {
	if (nodeEnv && nodeEnv !== 'production') return true;
	return trustHostEnv === 'true';
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [GitHub],
	callbacks: {
		jwt: authJwtCallback,
		session: authSessionCallback
	},
	trustHost: resolveTrustHost(env.NODE_ENV, env.AUTH_TRUST_HOST)
});

async function refreshAccessToken(token: Token) {
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
				refresh_token: String(token.refreshToken ?? '')
			})
		});

		const tokens = await response.json();

		if (!response.ok) {
			console.error('[AUTH] Refresh failed:', tokens);
			return { ...token, error: 'RefreshTokenError', accessToken: undefined };
		}

		return {
			...token,
			accessToken: tokens.access_token,
			expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
			refreshToken: tokens.refresh_token ?? token.refreshToken,
			error: undefined
		};
	} catch (error) {
		console.error('[AUTH] Refresh exception:', error);
		return { ...token, error: 'RefreshTokenError', accessToken: undefined };
	}
}

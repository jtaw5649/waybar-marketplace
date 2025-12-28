import { SvelteKitAuth, customFetch } from '@auth/sveltekit';
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
	error?: string;
};

type SessionCallbackParams = {
	session: SessionWithExtras;
	token: Token;
};

type RefreshConfig = {
	clientId?: string;
	clientSecret?: string;
};

export async function authJwtCallback(
	{ token, account, profile }: JwtCallbackParams,
	refreshConfig?: RefreshConfig
): Promise<Token> {
	if (account) {
		const accessToken = typeof account.access_token === 'string' ? account.access_token : undefined;
		const expiresAt = typeof account.expires_at === 'number' ? account.expires_at : undefined;
		const refreshToken =
			typeof account.refresh_token === 'string' ? account.refresh_token : undefined;
		const login = typeof profile?.login === 'string' ? profile.login : undefined;

		const nextToken: Token = {
			...token,
			accessToken,
			expiresAt,
			refreshToken,
			login,
			error: undefined
		};

		return nextToken;
	}

	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	const expiresAt = typeof token.expiresAt === 'number' ? token.expiresAt : null;

	if (expiresAt && Date.now() < expiresAt * 1000 - FIVE_MINUTES_MS) {
		return token;
	}

	if (expiresAt && token.refreshToken) {
		const refreshed = await refreshAccessToken(token, refreshConfig);
		return refreshed;
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
	session.error = typeof token.error === 'string' ? token.error : undefined;
	return session;
}

export function resolveTrustHost(
	nodeEnv?: string,
	trustHostEnv?: string,
	cfPagesEnv?: string,
	vercelEnv?: string
): boolean {
	if (nodeEnv && nodeEnv !== 'production') return true;
	if (trustHostEnv === 'true') return true;
	if (cfPagesEnv || vercelEnv) return true;
	return false;
}

export function resolveRedirectUrl(url: string, baseUrl: string): string {
	if (url.startsWith('/')) {
		return `${baseUrl}${url}`;
	}

	try {
		const resolved = new URL(url);
		if (resolved.origin === baseUrl) {
			return url;
		}
	} catch {
		return baseUrl;
	}

	return baseUrl;
}

export function githubAuthorizationParams() {
	return { scope: 'read:user user:email' };
}

type RefreshResponse = {
	error?: string;
	error_description?: string;
	[key: string]: unknown;
};

type SanitizedError = {
	error: string;
	error_description: string | undefined;
};

export function sanitizeRefreshError(tokens: RefreshResponse): SanitizedError {
	return {
		error: tokens.error ?? 'unknown',
		error_description: tokens.error_description
	};
}

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
	const authSecret = event.platform?.env?.AUTH_SECRET ?? env.AUTH_SECRET;
	const trustHostEnv = event.platform?.env?.AUTH_TRUST_HOST ?? env.AUTH_TRUST_HOST;
	const cfPagesEnv = event.platform?.env?.CF_PAGES ?? env.CF_PAGES;
	const vercelEnv = event.platform?.env?.VERCEL ?? env.VERCEL;
	const githubId = event.platform?.env?.AUTH_GITHUB_ID ?? env.AUTH_GITHUB_ID ?? '';
	const githubSecret = event.platform?.env?.AUTH_GITHUB_SECRET ?? env.AUTH_GITHUB_SECRET ?? '';
	const authFetch = event.fetch ?? fetch;

	return {
		providers: [
			GitHub({
				clientId: githubId,
				clientSecret: githubSecret,
				authorization: { params: githubAuthorizationParams() },
				[customFetch]: authFetch
			})
		],
		callbacks: {
			jwt: (params) => authJwtCallback(params, { clientId: githubId, clientSecret: githubSecret }),
			session: authSessionCallback,
			redirect: ({ url, baseUrl }) => resolveRedirectUrl(url, baseUrl)
		},
		secret: authSecret,
		trustHost: resolveTrustHost(env.NODE_ENV, trustHostEnv, cfPagesEnv, vercelEnv)
	};
});

async function refreshAccessToken(token: Token, refreshConfig?: RefreshConfig) {
	const clientId = refreshConfig?.clientId ?? env.AUTH_GITHUB_ID ?? '';
	const clientSecret = refreshConfig?.clientSecret ?? env.AUTH_GITHUB_SECRET ?? '';

	if (!clientId || !clientSecret) {
		console.error('[AUTH] Missing GitHub OAuth credentials for token refresh.');
		return { ...token, error: 'RefreshTokenError', accessToken: undefined };
	}

	try {
		const response = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			},
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: 'refresh_token',
				refresh_token: String(token.refreshToken ?? '')
			})
		});

		const tokens = await response.json();

		if (!response.ok) {
			console.error('[AUTH] Refresh failed:', sanitizeRefreshError(tokens));
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

import type { Session } from '@auth/sveltekit';
import type { Cookies } from '@sveltejs/kit';
import { decode } from '@auth/core/jwt';
import { env } from '$env/dynamic/private';

type DecodedToken = {
	accessToken?: string;
	[key: string]: unknown;
};

const SESSION_COOKIE_NAMES = ['authjs.session-token', '__Secure-authjs.session-token'] as const;

function getSessionTokenFromCookies(
	cookies: Cookies
): { token: string; cookieName: (typeof SESSION_COOKIE_NAMES)[number] } | null {
	for (const cookieName of SESSION_COOKIE_NAMES) {
		const token = cookies.get(cookieName);
		if (token) {
			return { token, cookieName };
		}
	}

	const allCookies = cookies.getAll();
	if (!allCookies.length) return null;

	for (const cookieName of SESSION_COOKIE_NAMES) {
		const prefix = `${cookieName}.`;
		const chunks = allCookies
			.filter((cookie) => cookie.name.startsWith(prefix))
			.map((cookie) => {
				const suffix = cookie.name.slice(prefix.length);
				const index = Number(suffix);
				if (!Number.isInteger(index) || index < 0) return null;
				return { index, value: cookie.value };
			})
			.filter((chunk): chunk is { index: number; value: string } => chunk !== null)
			.sort((a, b) => a.index - b.index);

		if (chunks.length) {
			return {
				token: chunks.map((chunk) => chunk.value).join(''),
				cookieName
			};
		}
	}

	return null;
}

export async function getServerToken(cookies?: Cookies): Promise<string | null> {
	if (!cookies) return null;
	const session = getSessionTokenFromCookies(cookies);

	if (!session) return null;

	try {
		const decoded = (await decode({
			token: session.token,
			secret: env.AUTH_SECRET ?? '',
			salt: session.cookieName
		})) as DecodedToken | null;

		return decoded?.accessToken ?? null;
	} catch {
		return null;
	}
}

export async function resolveAccessToken(
	cookies?: Cookies,
	session?: Session | { accessToken?: string } | null
): Promise<string | null> {
	const accessToken = session && 'accessToken' in session ? session.accessToken : undefined;
	if (accessToken) {
		return accessToken;
	}

	return getServerToken(cookies);
}

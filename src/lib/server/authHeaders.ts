export type HeaderMap = Record<string, string>;

export function authHeaders(token?: string, base: HeaderMap = {}): HeaderMap {
	if (!token) return { ...base };
	return { ...base, Authorization: `Bearer ${token}` };
}

export function acceptHeaders(token?: string, base: HeaderMap = {}): HeaderMap {
	return authHeaders(token, { ...base, Accept: 'application/json' });
}

export function jsonHeaders(token?: string, base: HeaderMap = {}): HeaderMap {
	return acceptHeaders(token, { ...base, 'Content-Type': 'application/json' });
}

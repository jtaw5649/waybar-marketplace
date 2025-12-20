export interface SessionValidation {
	isValid: boolean;
	hasToken: boolean;
	hasRefreshError: boolean;
	shouldReauth: boolean;
}

interface SessionLike {
	accessToken?: string;
	error?: string;
}

export function validateSession(session: SessionLike | null): SessionValidation {
	if (!session) {
		return { isValid: false, hasToken: false, hasRefreshError: false, shouldReauth: true };
	}

	const hasToken = !!session.accessToken;
	const hasRefreshError = session.error === 'RefreshTokenError';

	return {
		isValid: hasToken && !hasRefreshError,
		hasToken,
		hasRefreshError,
		shouldReauth: hasRefreshError || !hasToken
	};
}

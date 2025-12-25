export interface SessionValidation {
	isValid: boolean;
	hasToken: boolean;
	hasRefreshError: boolean;
	shouldReauth: boolean;
}

interface SessionLike {
	error?: string;
}

export function validateSession(session: SessionLike | null, hasToken: boolean): SessionValidation {
	if (!session) {
		return { isValid: false, hasToken: false, hasRefreshError: false, shouldReauth: true };
	}

	const hasRefreshError = session.error === 'RefreshTokenError';

	return {
		isValid: hasToken && !hasRefreshError,
		hasToken,
		hasRefreshError,
		shouldReauth: hasRefreshError || !hasToken
	};
}

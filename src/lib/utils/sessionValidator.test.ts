import { describe, it, expect } from 'vitest';
import { validateSession, type SessionValidation } from './sessionValidator';

describe('validateSession', () => {
	it('returns shouldReauth true for null session', () => {
		const result = validateSession(null);
		expect(result).toEqual<SessionValidation>({
			isValid: false,
			hasToken: false,
			hasRefreshError: false,
			shouldReauth: true
		});
	});

	it('returns valid for session with token and no error', () => {
		const session = { accessToken: 'valid-token' };
		const result = validateSession(session);
		expect(result).toEqual<SessionValidation>({
			isValid: true,
			hasToken: true,
			hasRefreshError: false,
			shouldReauth: false
		});
	});

	it('returns invalid for session with RefreshTokenError', () => {
		const session = { accessToken: undefined, error: 'RefreshTokenError' };
		const result = validateSession(session);
		expect(result).toEqual<SessionValidation>({
			isValid: false,
			hasToken: false,
			hasRefreshError: true,
			shouldReauth: true
		});
	});

	it('returns invalid for session with token but RefreshTokenError', () => {
		const session = { accessToken: 'stale-token', error: 'RefreshTokenError' };
		const result = validateSession(session);
		expect(result).toEqual<SessionValidation>({
			isValid: false,
			hasToken: true,
			hasRefreshError: true,
			shouldReauth: true
		});
	});

	it('returns shouldReauth for session without token', () => {
		const session = { accessToken: undefined };
		const result = validateSession(session);
		expect(result).toEqual<SessionValidation>({
			isValid: false,
			hasToken: false,
			hasRefreshError: false,
			shouldReauth: true
		});
	});
});

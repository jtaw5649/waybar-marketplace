import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuthenticatedAction, isAuthFailure } from './authAction';

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn()
}));

import { resolveAccessToken } from '$lib/server/token';

function createMockCookies() {
	return {
		get: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn(),
		getAll: vi.fn()
	};
}

function createMockEvent(session: unknown, accessToken: string | null) {
	vi.mocked(resolveAccessToken).mockResolvedValue(accessToken);
	return {
		locals: {
			auth: vi.fn().mockResolvedValue(session)
		},
		cookies: createMockCookies()
	};
}

describe('requireAuthenticatedAction', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns fail(401) when session is null', async () => {
		const event = createMockEvent(null, 'valid-token');

		const result = await requireAuthenticatedAction(event as never);

		expect(result).toHaveProperty('status', 401);
	});

	it('returns fail(401) when session.user is null', async () => {
		const event = createMockEvent({ user: null }, 'valid-token');

		const result = await requireAuthenticatedAction(event as never);

		expect(result).toHaveProperty('status', 401);
	});

	it('returns fail(401) when accessToken is null', async () => {
		const event = createMockEvent({ user: { login: 'test' } }, null);

		const result = await requireAuthenticatedAction(event as never);

		expect(result).toHaveProperty('status', 401);
	});

	it('returns fail(401) when session.error is RefreshTokenError', async () => {
		const event = createMockEvent(
			{ user: { login: 'test' }, error: 'RefreshTokenError' },
			'valid-token'
		);

		const result = await requireAuthenticatedAction(event as never);

		expect(result).toHaveProperty('status', 401);
	});

	it('returns session and accessToken on success', async () => {
		const session = { user: { login: 'test' } };
		const event = createMockEvent(session, 'valid-token');

		const result = await requireAuthenticatedAction(event as never);

		expect(result).not.toHaveProperty('status');
		expect(result).toEqual({ session, accessToken: 'valid-token' });
	});
});

describe('isAuthFailure', () => {
	it('returns true for fail() result with status property', () => {
		const failResult = { status: 401, data: { message: 'Unauthorized' } };
		expect(isAuthFailure(failResult)).toBe(true);
	});

	it('returns false for success result without status', () => {
		const successResult = { session: {}, accessToken: 'token' };
		expect(isAuthFailure(successResult)).toBe(false);
	});

	it('returns false for null', () => {
		expect(isAuthFailure(null)).toBe(false);
	});
});

// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

const mockCustomFetch = Symbol('customFetch');
const svelteKitAuthMock = vi.fn((_config: unknown) => ({
	handle: vi.fn(),
	signIn: vi.fn(),
	signOut: vi.fn()
}));
const githubMock = vi.fn((config) => config);

vi.mock('@auth/sveltekit', () => ({
	SvelteKitAuth: svelteKitAuthMock,
	customFetch: mockCustomFetch
}));

vi.mock('@auth/sveltekit/providers/github', () => ({
	default: githubMock
}));

describe('auth config', () => {
	it('sets custom fetch on GitHub provider', async () => {
		vi.resetModules();
		await import('./auth');

		type AuthConfigFactory = (event: {
			platform?: { env?: Record<string, string | undefined> };
			fetch: typeof fetch;
		}) => Promise<{ providers?: unknown[] }>;

		const authConfigFactory = svelteKitAuthMock.mock.calls[0]?.[0];
		expect(typeof authConfigFactory).toBe('function');
		if (typeof authConfigFactory !== 'function') {
			throw new Error('Missing auth config factory');
		}

		const event = { platform: { env: {} }, fetch: vi.fn() };
		const config = await (authConfigFactory as AuthConfigFactory)(event);
		const provider = config.providers?.[0] as Record<symbol, unknown> | undefined;

		expect(provider?.[mockCustomFetch]).toBe(event.fetch);
	});
});

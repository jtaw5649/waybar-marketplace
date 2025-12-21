import { afterEach, describe, expect, it, vi } from 'vitest';

const DEFAULT_API_BASE_URL = 'https://api.waybarmodules.dev';
const envMock: { PUBLIC_API_BASE_URL?: string } = {};

vi.mock('$env/dynamic/public', () => ({
	env: envMock
}));

describe('API_BASE_URL', () => {
	afterEach(() => {
		vi.resetModules();
		delete envMock.PUBLIC_API_BASE_URL;
	});

	it('uses PUBLIC_API_BASE_URL when set', async () => {
		vi.resetModules();
		envMock.PUBLIC_API_BASE_URL = 'http://localhost:8787';
		const { API_BASE_URL } = await import('./index');
		expect(API_BASE_URL).toBe('http://localhost:8787');
	});

	it('falls back to default when PUBLIC_API_BASE_URL is unset', async () => {
		vi.resetModules();
		const { API_BASE_URL } = await import('./index');
		expect(API_BASE_URL).toBe(DEFAULT_API_BASE_URL);
	});
});

import { describe, it, expect, vi } from 'vitest';
import { addSecurityHeaders, securityHeaders } from './hooks.server';

describe('security headers', () => {
	it('sets expected security headers', async () => {
		const response = new Response('ok');
		const resolve = vi.fn().mockResolvedValue(response);
		const event = {} as Parameters<typeof addSecurityHeaders>[0]['event'];

		const result = await addSecurityHeaders({ event, resolve });

		for (const [key, value] of Object.entries(securityHeaders)) {
			expect(result.headers.get(key)).toBe(value);
		}
	});
});

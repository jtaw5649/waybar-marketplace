import { describe, it, expect, vi } from 'vitest';
import { addSecurityHeaders, securityHeaders } from './hooks.server';

describe('security headers', () => {
	it('sets expected security headers', async () => {
		const response = new Response('ok');
		const resolve = vi.fn().mockResolvedValue(response);
		const event = {
			url: new URL('http://localhost')
		} as Parameters<typeof addSecurityHeaders>[0]['event'];

		const result = await addSecurityHeaders({ event, resolve });

		for (const [key, value] of Object.entries(securityHeaders)) {
			expect(result.headers.get(key)).toBe(value);
		}
	});

	it('sets Strict-Transport-Security on https requests', async () => {
		const response = new Response('ok');
		const resolve = vi.fn().mockResolvedValue(response);
		const event = {
			url: new URL('https://example.com')
		} as Parameters<typeof addSecurityHeaders>[0]['event'];

		const result = await addSecurityHeaders({ event, resolve });

		expect(result.headers.get('Strict-Transport-Security')).toBe(
			'max-age=31536000; includeSubDomains; preload'
		);
	});

	it('does not set Strict-Transport-Security on http requests', async () => {
		const response = new Response('ok');
		const resolve = vi.fn().mockResolvedValue(response);
		const event = {
			url: new URL('http://localhost')
		} as Parameters<typeof addSecurityHeaders>[0]['event'];

		const result = await addSecurityHeaders({ event, resolve });

		expect(result.headers.get('Strict-Transport-Security')).toBeNull();
	});

	it('sets X-Permitted-Cross-Domain-Policies header', async () => {
		const response = new Response('ok');
		const resolve = vi.fn().mockResolvedValue(response);
		const event = {
			url: new URL('http://localhost')
		} as Parameters<typeof addSecurityHeaders>[0]['event'];

		const result = await addSecurityHeaders({ event, resolve });

		expect(result.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
	});
});

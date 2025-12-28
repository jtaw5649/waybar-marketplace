import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { handle as authHandle } from './auth';

export const securityHeaders: Record<string, string> = {
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'X-XSS-Protection': '0',
	'X-Permitted-Cross-Domain-Policies': 'none',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Resource-Policy': 'same-site'
};

export const addSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		preload: ({ type, path }) => type === 'font' && path.startsWith('/fonts/')
	});

	for (const [key, value] of Object.entries(securityHeaders)) {
		response.headers.set(key, value);
	}

	if (event.url?.protocol === 'https:') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);
	}

	return response;
};

export const handle = sequence(authHandle, addSecurityHeaders);

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	console.error(`[${errorId}] ${status} ${event.request.method} ${event.url.pathname}:`, error);

	return {
		message: message || 'An unexpected error occurred',
		errorId
	};
};

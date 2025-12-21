import { API_BASE_URL } from '$lib';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { handle as authHandle } from './auth';

const apiOrigin = new URL(API_BASE_URL).origin;
const csp = [
	"default-src 'self'",
	`connect-src 'self' ${apiOrigin}`,
	"img-src 'self' https: data:",
	"style-src 'self' 'unsafe-inline'",
	"script-src 'self' 'unsafe-inline'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'"
].join('; ');

export const securityHeaders: Record<string, string> = {
	'Content-Security-Policy': csp,
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'X-XSS-Protection': '0',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Cross-Origin-Resource-Policy': 'same-site'
};

export const addSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	for (const [key, value] of Object.entries(securityHeaders)) {
		response.headers.set(key, value);
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

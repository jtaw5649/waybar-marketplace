import { handle as authHandle } from './auth';
import type { HandleServerError } from '@sveltejs/kit';

export const handle = authHandle;

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	console.error(`[${errorId}] ${status} ${event.request.method} ${event.url.pathname}:`, error);

	return {
		message: message || 'An unexpected error occurred',
		errorId
	};
};

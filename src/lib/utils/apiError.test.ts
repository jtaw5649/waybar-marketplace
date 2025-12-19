import { describe, it, expect } from 'vitest';
import { classifyApiError, ApiErrorType } from './apiError';

describe('classifyApiError', () => {
	describe('network errors', () => {
		it('classifies TypeError as network error', () => {
			const error = new TypeError('Failed to fetch');
			const result = classifyApiError(error);
			expect(result.type).toBe(ApiErrorType.Network);
		});

		it('classifies AbortError as network error', () => {
			const error = new DOMException('The operation was aborted', 'AbortError');
			const result = classifyApiError(error);
			expect(result.type).toBe(ApiErrorType.Network);
		});
	});

	describe('parse errors', () => {
		it('classifies SyntaxError as parse error', () => {
			const error = new SyntaxError('Unexpected token');
			const result = classifyApiError(error);
			expect(result.type).toBe(ApiErrorType.Parse);
		});
	});

	describe('HTTP status errors', () => {
		it('classifies 400 as client error', () => {
			const result = classifyApiError(null, 400);
			expect(result.type).toBe(ApiErrorType.ClientError);
			expect(result.statusCode).toBe(400);
		});

		it('classifies 401 as unauthorized', () => {
			const result = classifyApiError(null, 401);
			expect(result.type).toBe(ApiErrorType.Unauthorized);
		});

		it('classifies 403 as forbidden', () => {
			const result = classifyApiError(null, 403);
			expect(result.type).toBe(ApiErrorType.Forbidden);
		});

		it('classifies 404 as not found', () => {
			const result = classifyApiError(null, 404);
			expect(result.type).toBe(ApiErrorType.NotFound);
		});

		it('classifies 500 as server error', () => {
			const result = classifyApiError(null, 500);
			expect(result.type).toBe(ApiErrorType.ServerError);
			expect(result.statusCode).toBe(500);
		});

		it('classifies 502 as server error', () => {
			const result = classifyApiError(null, 502);
			expect(result.type).toBe(ApiErrorType.ServerError);
		});

		it('classifies 503 as server error', () => {
			const result = classifyApiError(null, 503);
			expect(result.type).toBe(ApiErrorType.ServerError);
		});
	});

	describe('unknown errors', () => {
		it('classifies generic Error as unknown', () => {
			const error = new Error('Something went wrong');
			const result = classifyApiError(error);
			expect(result.type).toBe(ApiErrorType.Unknown);
		});

		it('classifies string as unknown', () => {
			const result = classifyApiError('unexpected error');
			expect(result.type).toBe(ApiErrorType.Unknown);
		});

		it('classifies null with no status as unknown', () => {
			const result = classifyApiError(null);
			expect(result.type).toBe(ApiErrorType.Unknown);
		});
	});

	describe('user-friendly messages', () => {
		it('provides user message for network errors', () => {
			const error = new TypeError('Failed to fetch');
			const result = classifyApiError(error);
			expect(result.userMessage).toContain('connect');
		});

		it('provides user message for server errors', () => {
			const result = classifyApiError(null, 500);
			expect(result.userMessage).toContain('Server');
		});

		it('provides user message for parse errors', () => {
			const error = new SyntaxError('Unexpected token');
			const result = classifyApiError(error);
			expect(result.userMessage).toContain('invalid');
		});

		it('provides user message for unauthorized', () => {
			const result = classifyApiError(null, 401);
			expect(result.userMessage).toContain('log in');
		});

		it('provides user message for forbidden', () => {
			const result = classifyApiError(null, 403);
			expect(result.userMessage).toContain('permission');
		});

		it('provides user message for not found', () => {
			const result = classifyApiError(null, 404);
			expect(result.userMessage).toContain('not found');
		});
	});
});

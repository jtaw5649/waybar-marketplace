import { describe, it, expect, vi } from 'vitest';
import { fetchApiJson } from './apiClient';
import { classifyApiError } from '$lib/utils/apiError';

vi.mock('$lib', () => ({
	API_BASE_URL: 'https://api.example.com'
}));

describe('fetchApiJson', () => {
	it('returns data when response is ok', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ value: 42 })
		});

		const result = await fetchApiJson<{ value: number }>(fetchMock, '/api/v1/test');

		expect(result).toEqual({ data: { value: 42 }, error: null });
	});

	it('returns classified error when response is not ok', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
		const expected = classifyApiError(null, 500).userMessage;

		const result = await fetchApiJson(fetchMock, '/api/v1/test');

		expect(result).toEqual({ data: null, error: expected });
	});

	it('returns classified error when fetch throws', async () => {
		const failure = new TypeError('boom');
		const fetchMock = vi.fn().mockRejectedValue(failure);
		const expected = classifyApiError(failure).userMessage;

		const result = await fetchApiJson(fetchMock, '/api/v1/test');

		expect(result).toEqual({ data: null, error: expected });
	});

	it('adds Accept header and Authorization when token is provided', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true })
		});

		await fetchApiJson(fetchMock, '/api/v1/test', {
			token: 'token',
			headers: { 'X-Trace': 'on' }
		});

		expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/api/v1/test', {
			headers: {
				'X-Trace': 'on',
				Accept: 'application/json',
				Authorization: 'Bearer token'
			}
		});
	});
});

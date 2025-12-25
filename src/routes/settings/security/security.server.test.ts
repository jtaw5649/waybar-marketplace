// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { normalizeStarsPayload } from '$lib/utils/starsResponse';

describe('Security server actions', () => {
	it('exports exportData action', async () => {
		const { actions } = await import('./+page.server');
		expect(actions).toBeDefined();
		expect(actions.exportData).toBeDefined();
		expect(typeof actions.exportData).toBe('function');
	});
});

describe('Export data normalization', () => {
	it('extracts modules array from wrapped API response', () => {
		const wrappedResponse = { modules: [{ uuid: '1', name: 'test' }], total: 1 };
		const modules = wrappedResponse.modules || [];
		expect(Array.isArray(modules)).toBe(true);
		expect(modules).toHaveLength(1);
	});

	it('extracts stars array using normalizeStarsPayload', () => {
		const wrappedResponse = { modules: [{ uuid: '2', name: 'starred' }], total: 1 };
		const result = normalizeStarsPayload(wrappedResponse);
		expect(Array.isArray(result.modules)).toBe(true);
		expect(result.modules).toHaveLength(1);
	});

	it('handles nested data wrapper in stars response', () => {
		const nestedResponse = { data: { modules: [{ uuid: '3', name: 'nested' }], total: 1 } };
		const result = normalizeStarsPayload(nestedResponse);
		expect(Array.isArray(result.modules)).toBe(true);
		expect(result.modules).toHaveLength(1);
	});
});

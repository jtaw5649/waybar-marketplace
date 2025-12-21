import { describe, it, expect } from 'vitest';
import { normalizeStarsPayload } from './starsResponse';

type Star = { uuid: string };

describe('normalizeStarsPayload', () => {
	it('reads nested data payload', () => {
		const payload = { data: { modules: [{ uuid: 'a' }, { uuid: 'b' }], total: 2 } };
		const result = normalizeStarsPayload<Star>(payload);
		expect(result.modules.map((m) => m.uuid)).toEqual(['a', 'b']);
		expect(result.total).toBe(2);
	});

	it('reads flat payload', () => {
		const payload = { modules: [{ uuid: 'x' }], total: 1, version: 1 };
		const result = normalizeStarsPayload<Star>(payload);
		expect(result.modules.map((m) => m.uuid)).toEqual(['x']);
		expect(result.total).toBe(1);
	});

	it('returns empty payload for invalid input', () => {
		const result = normalizeStarsPayload<Star>(null);
		expect(result.modules).toEqual([]);
		expect(result.total).toBe(0);
	});
});

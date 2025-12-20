import { describe, it, expect } from 'vitest';
import { formatDownloads } from './formatDownloads';

describe('formatDownloads', () => {
	it('returns raw number for values under 1000', () => {
		expect(formatDownloads(0)).toBe('0');
		expect(formatDownloads(1)).toBe('1');
		expect(formatDownloads(999)).toBe('999');
	});

	it('formats thousands with k suffix', () => {
		expect(formatDownloads(1000)).toBe('1.0k');
		expect(formatDownloads(1500)).toBe('1.5k');
		expect(formatDownloads(999999)).toBe('1000.0k');
	});

	it('formats millions with M suffix', () => {
		expect(formatDownloads(1000000)).toBe('1.0M');
		expect(formatDownloads(1500000)).toBe('1.5M');
		expect(formatDownloads(10000000)).toBe('10.0M');
	});
});

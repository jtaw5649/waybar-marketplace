import { describe, expect, it } from 'vitest';
import { formatDate, formatDateTime, formatMonthYear } from './formatDate';

describe('formatDate', () => {
	it('formats date with year, month short, day by default', () => {
		const result = formatDate('2024-12-15T10:30:00Z');
		expect(result).toContain('Dec');
		expect(result).toContain('15');
		expect(result).toContain('2024');
	});
});

describe('formatDateTime', () => {
	it('formats date with time', () => {
		const result = formatDateTime('2024-12-15T14:30:00Z');
		expect(result).toContain('Dec');
		expect(result).toContain('2024');
	});
});

describe('formatMonthYear', () => {
	it('formats with long month and year only', () => {
		const result = formatMonthYear('2024-12-15');
		expect(result).toContain('December');
		expect(result).toContain('2024');
	});
});

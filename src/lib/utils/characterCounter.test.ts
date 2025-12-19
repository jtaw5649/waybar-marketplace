import { describe, it, expect } from 'vitest';
import { getCharacterCounterState } from './characterCounter';

describe('getCharacterCounterState', () => {
	describe('normal state', () => {
		it('returns normal when well under limit', () => {
			const result = getCharacterCounterState(10, 100);
			expect(result.state).toBe('normal');
			expect(result.current).toBe(10);
			expect(result.max).toBe(100);
			expect(result.remaining).toBe(90);
		});

		it('returns normal at 0 characters', () => {
			const result = getCharacterCounterState(0, 50);
			expect(result.state).toBe('normal');
		});

		it('returns normal below 80% threshold', () => {
			const result = getCharacterCounterState(79, 100);
			expect(result.state).toBe('normal');
		});
	});

	describe('warning state', () => {
		it('returns warning at 80% of limit', () => {
			const result = getCharacterCounterState(80, 100);
			expect(result.state).toBe('warning');
		});

		it('returns warning between 80% and 100%', () => {
			const result = getCharacterCounterState(90, 100);
			expect(result.state).toBe('warning');
			expect(result.remaining).toBe(10);
		});

		it('returns warning at 99% of limit', () => {
			const result = getCharacterCounterState(99, 100);
			expect(result.state).toBe('warning');
		});
	});

	describe('error state', () => {
		it('returns error at exactly limit', () => {
			const result = getCharacterCounterState(100, 100);
			expect(result.state).toBe('error');
			expect(result.remaining).toBe(0);
		});

		it('returns error when over limit', () => {
			const result = getCharacterCounterState(110, 100);
			expect(result.state).toBe('error');
			expect(result.remaining).toBe(-10);
		});
	});

	describe('display formatting', () => {
		it('formats display as current/max', () => {
			const result = getCharacterCounterState(25, 50);
			expect(result.display).toBe('25/50');
		});

		it('handles large numbers', () => {
			const result = getCharacterCounterState(450, 500);
			expect(result.display).toBe('450/500');
		});
	});

	describe('percentage calculation', () => {
		it('calculates percentage correctly', () => {
			const result = getCharacterCounterState(50, 100);
			expect(result.percentage).toBe(50);
		});

		it('handles 0 max gracefully', () => {
			const result = getCharacterCounterState(0, 0);
			expect(result.percentage).toBe(0);
			expect(result.state).toBe('normal');
		});
	});
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { toast } from './toast';

describe('toast store', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		toast.reset();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('initial state', () => {
		it('starts with empty toast list', () => {
			expect(get(toast)).toEqual([]);
		});
	});

	describe('adding toasts', () => {
		it('adds success toast with correct variant', () => {
			toast.success('Success message');
			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
			expect(toasts[0].variant).toBe('success');
			expect(toasts[0].message).toBe('Success message');
		});

		it('adds error toast with correct variant', () => {
			toast.error('Error message');
			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
			expect(toasts[0].variant).toBe('error');
			expect(toasts[0].message).toBe('Error message');
		});

		it('adds warning toast with correct variant', () => {
			toast.warning('Warning message');
			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
			expect(toasts[0].variant).toBe('warning');
			expect(toasts[0].message).toBe('Warning message');
		});

		it('adds info toast with correct variant', () => {
			toast.info('Info message');
			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
			expect(toasts[0].variant).toBe('info');
			expect(toasts[0].message).toBe('Info message');
		});

		it('returns toast id when adding', () => {
			const id = toast.success('Test');
			expect(typeof id).toBe('string');
			expect(id.length).toBeGreaterThan(0);
		});

		it('adds multiple toasts', () => {
			toast.success('First');
			toast.error('Second');
			toast.info('Third');
			expect(get(toast)).toHaveLength(3);
		});

		it('uses default duration of 5000ms', () => {
			toast.success('Test');
			const toasts = get(toast);
			expect(toasts[0].duration).toBe(5000);
		});

		it('accepts custom duration', () => {
			toast.success('Test', 3000);
			const toasts = get(toast);
			expect(toasts[0].duration).toBe(3000);
		});
	});

	describe('auto-dismiss', () => {
		it('removes toast after duration expires', () => {
			toast.success('Test', 1000);
			expect(get(toast)).toHaveLength(1);
			vi.advanceTimersByTime(1000);
			expect(get(toast)).toHaveLength(0);
		});

		it('does not remove toast before duration expires', () => {
			toast.success('Test', 2000);
			vi.advanceTimersByTime(1999);
			expect(get(toast)).toHaveLength(1);
		});

		it('handles multiple toasts with different durations', () => {
			toast.success('Short', 1000);
			toast.error('Long', 3000);
			expect(get(toast)).toHaveLength(2);
			vi.advanceTimersByTime(1000);
			expect(get(toast)).toHaveLength(1);
			expect(get(toast)[0].message).toBe('Long');
			vi.advanceTimersByTime(2000);
			expect(get(toast)).toHaveLength(0);
		});

		it('does not auto-dismiss when duration is 0', () => {
			toast.success('Persistent', 0);
			vi.advanceTimersByTime(10000);
			expect(get(toast)).toHaveLength(1);
		});
	});

	describe('manual removal', () => {
		it('removes toast by id', () => {
			const id = toast.success('Test', 0);
			expect(get(toast)).toHaveLength(1);
			toast.remove(id);
			expect(get(toast)).toHaveLength(0);
		});

		it('removes only the specified toast', () => {
			const id1 = toast.success('First', 0);
			toast.error('Second', 0);
			toast.remove(id1);
			const remaining = get(toast);
			expect(remaining).toHaveLength(1);
			expect(remaining[0].message).toBe('Second');
		});

		it('handles removing non-existent id gracefully', () => {
			toast.success('Test', 0);
			toast.remove('non-existent-id');
			expect(get(toast)).toHaveLength(1);
		});
	});

	describe('reset', () => {
		it('clears all toasts', () => {
			toast.success('First', 0);
			toast.error('Second', 0);
			toast.info('Third', 0);
			expect(get(toast)).toHaveLength(3);
			toast.reset();
			expect(get(toast)).toHaveLength(0);
		});
	});

	describe('subscription', () => {
		it('notifies subscribers when toast is added', () => {
			const values: unknown[] = [];
			const unsubscribe = toast.subscribe((v) => values.push([...v]));
			toast.success('Test', 0);
			expect(values.length).toBe(2);
			expect((values[1] as unknown[]).length).toBe(1);
			unsubscribe();
		});

		it('notifies subscribers when toast is removed', () => {
			const id = toast.success('Test', 0);
			const values: unknown[] = [];
			const unsubscribe = toast.subscribe((v) => values.push([...v]));
			toast.remove(id);
			expect(values.length).toBe(2);
			expect((values[1] as unknown[]).length).toBe(0);
			unsubscribe();
		});
	});

	describe('pause and resume', () => {
		it('toast starts with isPaused false', () => {
			toast.success('Test');
			const toasts = get(toast);
			expect(toasts[0].isPaused).toBe(false);
		});

		it('pause sets isPaused to true', () => {
			const id = toast.success('Test', 5000);
			toast.pause(id);
			const toasts = get(toast);
			expect(toasts[0].isPaused).toBe(true);
		});

		it('pause stops auto-dismiss countdown', () => {
			const id = toast.success('Test', 1000);
			vi.advanceTimersByTime(500);
			toast.pause(id);
			vi.advanceTimersByTime(1000);
			expect(get(toast)).toHaveLength(1);
		});

		it('resume sets isPaused to false', () => {
			const id = toast.success('Test', 5000);
			toast.pause(id);
			toast.resume(id);
			const toasts = get(toast);
			expect(toasts[0].isPaused).toBe(false);
		});

		it('resume restarts countdown with remaining time', () => {
			const id = toast.success('Test', 2000);
			vi.advanceTimersByTime(500);
			toast.pause(id);
			vi.advanceTimersByTime(1000);
			toast.resume(id);
			expect(get(toast)).toHaveLength(1);
			vi.advanceTimersByTime(1500);
			expect(get(toast)).toHaveLength(0);
		});

		it('toast has startTime when created', () => {
			vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
			toast.success('Test');
			const toasts = get(toast);
			expect(toasts[0].startTime).toBe(Date.now());
		});

		it('pause updates remainingTime based on elapsed time', () => {
			const id = toast.success('Test', 5000);
			vi.advanceTimersByTime(2000);
			toast.pause(id);
			const toasts = get(toast);
			expect(toasts[0].remainingTime).toBe(3000);
		});

		it('pause on non-existent id does nothing', () => {
			toast.success('Test', 5000);
			expect(() => toast.pause('non-existent')).not.toThrow();
		});

		it('resume on non-existent id does nothing', () => {
			toast.success('Test', 5000);
			expect(() => toast.resume('non-existent')).not.toThrow();
		});

		it('does not pause if duration is 0', () => {
			const id = toast.success('Test', 0);
			toast.pause(id);
			const toasts = get(toast);
			expect(toasts[0].isPaused).toBe(false);
		});
	});
});

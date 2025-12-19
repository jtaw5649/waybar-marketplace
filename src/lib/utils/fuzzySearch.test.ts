import { describe, it, expect } from 'vitest';
import {
	fuzzySearch,
	type SearchableItem,
	type SearchResult as _SearchResult
} from './fuzzySearch';

describe('fuzzySearch', () => {
	const items: SearchableItem[] = [
		{ id: '1', name: 'Battery Monitor', description: 'Shows battery status' },
		{ id: '2', name: 'CPU Usage', description: 'Monitor CPU performance' },
		{ id: '3', name: 'Network Traffic', description: 'Track network bandwidth' },
		{ id: '4', name: 'Memory Usage', description: 'RAM consumption tracker' }
	];

	describe('basic matching', () => {
		it('returns empty array for empty query', () => {
			const results = fuzzySearch(items, '');
			expect(results).toEqual([]);
		});

		it('returns empty array for whitespace-only query', () => {
			const results = fuzzySearch(items, '   ');
			expect(results).toEqual([]);
		});

		it('returns empty array when no matches found', () => {
			const results = fuzzySearch(items, 'xyz123');
			expect(results).toEqual([]);
		});

		it('finds exact matches', () => {
			const results = fuzzySearch(items, 'Battery');
			expect(results.length).toBe(1);
			expect(results[0].item.id).toBe('1');
		});

		it('finds case-insensitive matches', () => {
			const results = fuzzySearch(items, 'battery');
			expect(results.length).toBe(1);
			expect(results[0].item.id).toBe('1');
		});

		it('finds partial matches', () => {
			const results = fuzzySearch(items, 'batt');
			expect(results.length).toBe(1);
			expect(results[0].item.id).toBe('1');
		});
	});

	describe('search fields', () => {
		it('searches name field by default', () => {
			const results = fuzzySearch(items, 'Monitor');
			expect(results.some((r) => r.item.id === '1')).toBe(true);
		});

		it('searches description field', () => {
			const results = fuzzySearch(items, 'bandwidth');
			expect(results.length).toBe(1);
			expect(results[0].item.id).toBe('3');
		});

		it('searches custom fields when specified', () => {
			const customItems = [
				{ id: '1', name: 'Item A', category: 'widgets' },
				{ id: '2', name: 'Item B', category: 'tools' }
			];
			const results = fuzzySearch(customItems, 'widgets', ['category']);
			expect(results.length).toBe(1);
			expect(results[0].item.id).toBe('1');
		});
	});

	describe('result highlighting', () => {
		it('includes highlighted text in results', () => {
			const results = fuzzySearch(items, 'battery');
			expect(results.length).toBe(1);
			expect(results[0].highlights).toBeDefined();
			expect(results[0].highlights.name).toContain('<mark>');
		});

		it('highlights matching portions only', () => {
			const results = fuzzySearch(items, 'bat');
			expect(results.length).toBe(1);
			expect(results[0].highlights.name).toMatch(/<mark>.*bat.*<\/mark>/i);
		});
	});

	describe('result ordering', () => {
		it('ranks exact matches higher than partial matches', () => {
			const testItems = [
				{ id: '1', name: 'CPU Monitor' },
				{ id: '2', name: 'CPU' }
			];
			const results = fuzzySearch(testItems, 'CPU');
			expect(results[0].item.id).toBe('2');
		});

		it('ranks name matches higher than description matches', () => {
			const testItems = [
				{ id: '1', name: 'Battery', description: 'Power status' },
				{ id: '2', name: 'Power Saver', description: 'Battery optimization' }
			];
			const results = fuzzySearch(testItems, 'battery');
			expect(results[0].item.id).toBe('1');
		});
	});

	describe('empty items', () => {
		it('returns empty array for empty items list', () => {
			const results = fuzzySearch([], 'test');
			expect(results).toEqual([]);
		});
	});
});

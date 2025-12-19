import { describe, it, expect, beforeEach } from 'vitest';
import {
	isOpen,
	mode,
	query,
	modules,
	open,
	close,
	toggle,
	setMode,
	setQuery,
	setModules,
	reset
} from './commandPalette';
import { get } from 'svelte/store';
import type { PaletteMode, Module } from '$lib/types';

describe('commandPalette store', () => {
	beforeEach(() => {
		reset();
	});

	describe('initial state', () => {
		it('starts closed', () => {
			expect(get(isOpen)).toBe(false);
		});

		it('starts with mode "all"', () => {
			expect(get(mode)).toBe('all');
		});

		it('starts with empty query', () => {
			expect(get(query)).toBe('');
		});

		it('starts with empty modules', () => {
			expect(get(modules)).toEqual([]);
		});
	});

	describe('open', () => {
		it('opens the palette', () => {
			open();
			expect(get(isOpen)).toBe(true);
		});

		it('clears query when opening', () => {
			setQuery('test');
			close();
			open();
			expect(get(query)).toBe('');
		});
	});

	describe('close', () => {
		it('closes the palette', () => {
			open();
			close();
			expect(get(isOpen)).toBe(false);
		});
	});

	describe('toggle', () => {
		it('opens when closed', () => {
			toggle();
			expect(get(isOpen)).toBe(true);
		});

		it('closes when open', () => {
			open();
			toggle();
			expect(get(isOpen)).toBe(false);
		});
	});

	describe('setMode', () => {
		it('sets mode to modules', () => {
			setMode('modules');
			expect(get(mode)).toBe('modules');
		});

		it('sets mode to pages', () => {
			setMode('pages');
			expect(get(mode)).toBe('pages');
		});

		it('sets mode to commands', () => {
			setMode('commands');
			expect(get(mode)).toBe('commands');
		});

		it('sets mode back to all', () => {
			setMode('commands');
			setMode('all');
			expect(get(mode)).toBe('all');
		});
	});

	describe('setQuery', () => {
		it('sets the search query', () => {
			setQuery('battery');
			expect(get(query)).toBe('battery');
		});

		it('updates query on change', () => {
			setQuery('cpu');
			setQuery('memory');
			expect(get(query)).toBe('memory');
		});
	});

	describe('setModules', () => {
		it('caches modules', () => {
			const testModules: Module[] = [
				{
					uuid: '1',
					name: 'Battery Monitor',
					description: 'Shows battery status',
					author: 'test',
					category: 'system'
				}
			];
			setModules(testModules);
			expect(get(modules)).toEqual(testModules);
		});

		it('replaces existing modules', () => {
			const first: Module[] = [
				{ uuid: '1', name: 'First', description: '', author: '', category: '' }
			];
			const second: Module[] = [
				{ uuid: '2', name: 'Second', description: '', author: '', category: '' }
			];
			setModules(first);
			setModules(second);
			expect(get(modules)).toEqual(second);
		});
	});

	describe('reset', () => {
		it('resets all state', () => {
			open();
			setMode('commands');
			setQuery('test');
			setModules([{ uuid: '1', name: 'Test', description: '', author: '', category: '' }]);

			reset();

			expect(get(isOpen)).toBe(false);
			expect(get(mode)).toBe('all');
			expect(get(query)).toBe('');
			expect(get(modules)).toEqual([]);
		});
	});
});

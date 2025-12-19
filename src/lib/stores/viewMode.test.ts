import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({
	browser: true
}));

describe('viewMode store', () => {
	let mockStorage: Record<string, string> = {};

	beforeEach(() => {
		vi.resetModules();
		mockStorage = {};

		vi.stubGlobal('localStorage', {
			getItem: vi.fn((key: string) => mockStorage[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				mockStorage[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete mockStorage[key];
			}),
			clear: vi.fn(() => {
				mockStorage = {};
			})
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('initial state', () => {
		it('defaults to grid view when no stored preference', async () => {
			const { viewMode } = await import('./viewMode');
			expect(get(viewMode)).toBe('grid');
		});

		it('uses stored grid preference', async () => {
			mockStorage['browse-view-mode'] = 'grid';
			const { viewMode } = await import('./viewMode');
			expect(get(viewMode)).toBe('grid');
		});

		it('uses stored list preference', async () => {
			mockStorage['browse-view-mode'] = 'list';
			const { viewMode } = await import('./viewMode');
			expect(get(viewMode)).toBe('list');
		});

		it('ignores invalid stored value and defaults to grid', async () => {
			mockStorage['browse-view-mode'] = 'invalid';
			const { viewMode } = await import('./viewMode');
			expect(get(viewMode)).toBe('grid');
		});
	});

	describe('set', () => {
		it('updates store value to list', async () => {
			const { viewMode } = await import('./viewMode');
			viewMode.set('list');
			expect(get(viewMode)).toBe('list');
		});

		it('updates store value to grid', async () => {
			mockStorage['browse-view-mode'] = 'list';
			const { viewMode } = await import('./viewMode');
			viewMode.set('grid');
			expect(get(viewMode)).toBe('grid');
		});

		it('persists list to localStorage', async () => {
			const { viewMode } = await import('./viewMode');
			viewMode.set('list');
			expect(localStorage.setItem).toHaveBeenCalledWith('browse-view-mode', 'list');
		});

		it('persists grid to localStorage', async () => {
			const { viewMode } = await import('./viewMode');
			viewMode.set('grid');
			expect(localStorage.setItem).toHaveBeenCalledWith('browse-view-mode', 'grid');
		});
	});

	describe('toggle', () => {
		it('toggles from grid to list', async () => {
			mockStorage['browse-view-mode'] = 'grid';
			const { viewMode } = await import('./viewMode');
			viewMode.toggle();
			expect(get(viewMode)).toBe('list');
		});

		it('toggles from list to grid', async () => {
			mockStorage['browse-view-mode'] = 'list';
			const { viewMode } = await import('./viewMode');
			viewMode.toggle();
			expect(get(viewMode)).toBe('grid');
		});

		it('toggles from default (grid) to list', async () => {
			const { viewMode } = await import('./viewMode');
			viewMode.toggle();
			expect(get(viewMode)).toBe('list');
		});

		it('persists toggle result to localStorage', async () => {
			const { viewMode } = await import('./viewMode');
			viewMode.toggle();
			expect(localStorage.setItem).toHaveBeenCalledWith('browse-view-mode', 'list');
		});
	});

	describe('ViewMode type', () => {
		it('accepts valid view mode values', async () => {
			const { viewMode } = await import('./viewMode');
			const validModes = ['grid', 'list'] as const;
			for (const mode of validModes) {
				viewMode.set(mode);
				expect(get(viewMode)).toBe(mode);
			}
		});
	});
});

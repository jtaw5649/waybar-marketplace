import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({
	browser: true
}));

describe('sidebar store', () => {
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
		it('defaults to expanded (false) when no stored preference', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			expect(get(sidebarCollapsed)).toBe(false);
		});

		it('uses stored collapsed preference (true)', async () => {
			mockStorage['sidebar-collapsed'] = 'true';
			const { sidebarCollapsed } = await import('./sidebar');
			expect(get(sidebarCollapsed)).toBe(true);
		});

		it('uses stored expanded preference (false)', async () => {
			mockStorage['sidebar-collapsed'] = 'false';
			const { sidebarCollapsed } = await import('./sidebar');
			expect(get(sidebarCollapsed)).toBe(false);
		});

		it('ignores invalid stored value and defaults to expanded', async () => {
			mockStorage['sidebar-collapsed'] = 'invalid';
			const { sidebarCollapsed } = await import('./sidebar');
			expect(get(sidebarCollapsed)).toBe(false);
		});
	});

	describe('set', () => {
		it('updates store value to collapsed', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.set(true);
			expect(get(sidebarCollapsed)).toBe(true);
		});

		it('updates store value to expanded', async () => {
			mockStorage['sidebar-collapsed'] = 'true';
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.set(false);
			expect(get(sidebarCollapsed)).toBe(false);
		});

		it('persists collapsed state to localStorage', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.set(true);
			expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
		});

		it('persists expanded state to localStorage', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.set(false);
			expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'false');
		});
	});

	describe('toggle', () => {
		it('toggles from expanded to collapsed', async () => {
			mockStorage['sidebar-collapsed'] = 'false';
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.toggle();
			expect(get(sidebarCollapsed)).toBe(true);
		});

		it('toggles from collapsed to expanded', async () => {
			mockStorage['sidebar-collapsed'] = 'true';
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.toggle();
			expect(get(sidebarCollapsed)).toBe(false);
		});

		it('toggles from default (expanded) to collapsed', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.toggle();
			expect(get(sidebarCollapsed)).toBe(true);
		});

		it('persists toggle result to localStorage', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.toggle();
			expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
		});
	});

	describe('expand', () => {
		it('sets sidebar to expanded state', async () => {
			mockStorage['sidebar-collapsed'] = 'true';
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.expand();
			expect(get(sidebarCollapsed)).toBe(false);
		});

		it('persists expanded state', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.expand();
			expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'false');
		});
	});

	describe('collapse', () => {
		it('sets sidebar to collapsed state', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.collapse();
			expect(get(sidebarCollapsed)).toBe(true);
		});

		it('persists collapsed state', async () => {
			const { sidebarCollapsed } = await import('./sidebar');
			sidebarCollapsed.collapse();
			expect(localStorage.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true');
		});
	});
});

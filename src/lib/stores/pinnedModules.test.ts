import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

vi.mock('$app/environment', () => ({
	browser: true
}));

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('pinnedModules store', () => {
	beforeEach(async () => {
		localStorageMock.clear();
		vi.resetModules();
	});

	it('starts with empty array', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		expect(get(pinnedModules)).toEqual([]);
	});

	it('adds a module to pinned list', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		expect(get(pinnedModules)).toContain('uuid-1');
	});

	it('removes a module from pinned list', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		pinnedModules.add('uuid-2');
		pinnedModules.remove('uuid-1');
		expect(get(pinnedModules)).not.toContain('uuid-1');
		expect(get(pinnedModules)).toContain('uuid-2');
	});

	it('toggles module pin status', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.toggle('uuid-1');
		expect(get(pinnedModules)).toContain('uuid-1');
		pinnedModules.toggle('uuid-1');
		expect(get(pinnedModules)).not.toContain('uuid-1');
	});

	it('does not add duplicates', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		pinnedModules.add('uuid-1');
		expect(get(pinnedModules).filter((id) => id === 'uuid-1')).toHaveLength(1);
	});

	it('limits to MAX_PINNED modules', async () => {
		const { pinnedModules, MAX_PINNED_MODULES } = await import('./pinnedModules');
		for (let i = 0; i < MAX_PINNED_MODULES + 2; i++) {
			pinnedModules.add(`uuid-${i}`);
		}
		expect(get(pinnedModules)).toHaveLength(MAX_PINNED_MODULES);
	});

	it('isPinned returns true for pinned modules', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		const list = get(pinnedModules);
		expect(pinnedModules.isPinned('uuid-1', list)).toBe(true);
		expect(pinnedModules.isPinned('uuid-2', list)).toBe(false);
	});

	it('canPin returns false when at max', async () => {
		const { pinnedModules, MAX_PINNED_MODULES } = await import('./pinnedModules');
		for (let i = 0; i < MAX_PINNED_MODULES; i++) {
			pinnedModules.add(`uuid-${i}`);
		}
		const list = get(pinnedModules);
		expect(pinnedModules.canPin(list)).toBe(false);
	});

	it('canPin returns true when under max', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		const list = get(pinnedModules);
		expect(pinnedModules.canPin(list)).toBe(true);
	});

	it('clears all pinned modules', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		pinnedModules.add('uuid-2');
		pinnedModules.clear();
		expect(get(pinnedModules)).toEqual([]);
	});

	it('persists to localStorage', async () => {
		const { pinnedModules } = await import('./pinnedModules');
		pinnedModules.add('uuid-1');
		expect(JSON.parse(localStorageMock.getItem('pinned_modules') || '[]')).toContain('uuid-1');
	});
});

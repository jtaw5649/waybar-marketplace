import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Mock $app/environment
vi.mock('$app/environment', () => ({
	browser: true
}));

describe('theme store', () => {
	let mockStorage: Record<string, string> = {};
	let mockSetAttribute: ReturnType<typeof vi.fn>;
	let mockMediaQuery: {
		matches: boolean;
		addEventListener: ReturnType<typeof vi.fn>;
		removeEventListener: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		vi.resetModules();
		mockStorage = {};
		mockSetAttribute = vi.fn();
		mockMediaQuery = {
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		};

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

		vi.stubGlobal('document', {
			documentElement: {
				setAttribute: mockSetAttribute
			}
		});

		vi.stubGlobal('window', {
			matchMedia: vi.fn().mockReturnValue(mockMediaQuery)
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('initial state', () => {
		it('defaults to system theme when no stored preference', async () => {
			const { theme } = await import('./theme');
			expect(get(theme)).toBe('system');
		});

		it('uses stored theme when available', async () => {
			mockStorage['theme'] = 'dark';
			const { theme } = await import('./theme');
			expect(get(theme)).toBe('dark');
		});

		it('ignores invalid stored theme', async () => {
			mockStorage['theme'] = 'invalid';
			const { theme } = await import('./theme');
			expect(get(theme)).toBe('system');
		});
	});

	describe('set', () => {
		it('updates store value', async () => {
			const { theme } = await import('./theme');
			theme.set('dark');
			expect(get(theme)).toBe('dark');
		});

		it('persists to localStorage', async () => {
			const { theme } = await import('./theme');
			theme.set('light');
			expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
		});

		it('applies theme to document', async () => {
			const { theme } = await import('./theme');
			theme.set('dark');
			expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
		});
	});

	describe('toggle', () => {
		it('toggles from dark to light', async () => {
			mockStorage['theme'] = 'dark';
			const { theme } = await import('./theme');
			theme.toggle();
			expect(get(theme)).toBe('light');
		});

		it('toggles from light to dark', async () => {
			mockStorage['theme'] = 'light';
			const { theme } = await import('./theme');
			theme.toggle();
			expect(get(theme)).toBe('dark');
		});

		it('resolves system theme before toggling', async () => {
			mockMediaQuery.matches = true; // dark mode
			mockStorage['theme'] = 'system';
			const { theme } = await import('./theme');
			theme.toggle();
			// System was dark, so toggle to light
			expect(get(theme)).toBe('light');
		});
	});

	describe('setSystem', () => {
		it('sets theme to system', async () => {
			mockStorage['theme'] = 'dark';
			const { theme } = await import('./theme');
			theme.setSystem();
			expect(get(theme)).toBe('system');
		});

		it('persists system preference', async () => {
			const { theme } = await import('./theme');
			theme.setSystem();
			expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'system');
		});
	});

	describe('cycle', () => {
		it('cycles from system to light', async () => {
			mockStorage['theme'] = 'system';
			const { theme } = await import('./theme');
			theme.cycle();
			expect(get(theme)).toBe('light');
		});

		it('cycles from light to dark', async () => {
			mockStorage['theme'] = 'light';
			const { theme } = await import('./theme');
			theme.cycle();
			expect(get(theme)).toBe('dark');
		});

		it('cycles from dark to system', async () => {
			mockStorage['theme'] = 'dark';
			const { theme } = await import('./theme');
			theme.cycle();
			expect(get(theme)).toBe('system');
		});
	});

	describe('cleanup', () => {
		it('removes event listener', async () => {
			const { theme } = await import('./theme');
			theme.cleanup();
			expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
		});
	});

	describe('Theme type', () => {
		it('accepts valid theme values', async () => {
			const { theme } = await import('./theme');
			const validThemes = ['light', 'dark', 'system'] as const;
			for (const t of validThemes) {
				theme.set(t);
				expect(get(theme)).toBe(t);
			}
		});
	});

	describe('system theme detection', () => {
		it('detects dark system preference', async () => {
			mockMediaQuery.matches = true;
			mockStorage['theme'] = 'system';
			const { theme: _theme } = await import('./theme');
			// When system theme is applied, it should set data-theme to 'dark'
			expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
		});

		it('detects light system preference', async () => {
			mockMediaQuery.matches = false;
			mockStorage['theme'] = 'system';
			const { theme: _theme } = await import('./theme');
			expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
		});

		it('registers media query listener', async () => {
			await import('./theme');
			expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
		});
	});
});

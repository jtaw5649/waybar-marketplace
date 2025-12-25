import { vi } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
	env: {}
}));

Object.defineProperty(globalThis, 'localStorage', {
	value: {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {}
	},
	writable: true
});

if (typeof window !== 'undefined') {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: query === '(prefers-reduced-motion: reduce)',
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn()
		}))
	});
}

if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	Element.prototype.animate = () =>
		({
			cancel: () => {},
			onfinish: null,
			finished: Promise.resolve({} as Animation)
		}) as Animation;
}

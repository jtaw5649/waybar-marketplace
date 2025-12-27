// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import BackToTop from './BackToTop.svelte';

const createMatchMedia = (matches: boolean) =>
	vi.fn().mockImplementation((query: string) => ({
		matches,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn()
	}));

const setScrollY = (value: number) => {
	Object.defineProperty(window, 'scrollY', {
		value,
		configurable: true,
		writable: true
	});
};

const setInnerHeight = (value: number) => {
	Object.defineProperty(window, 'innerHeight', {
		value,
		configurable: true,
		writable: true
	});
};

const setScrollHeight = (value: number) => {
	Object.defineProperty(document.documentElement, 'scrollHeight', {
		value,
		configurable: true
	});
};

const setBodyScrollTop = (value: number) => {
	Object.defineProperty(document.body, 'scrollTop', {
		value,
		configurable: true,
		writable: true
	});
};

describe('BackToTop', () => {
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		setInnerHeight(800);
		setScrollHeight(2400);
		setScrollY(0);
		vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
			callback(0);
			return 0;
		});
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
		vi.restoreAllMocks();
	});

	it('reveals only after scrolling past the reveal offset', async () => {
		const { container } = render(BackToTop);
		await tick();

		const button = container.querySelector('[data-back-to-top]') as HTMLButtonElement | null;
		expect(button).toBeTruthy();
		expect(button?.dataset.visible).toBe('false');

		setScrollY(1000);
		window.dispatchEvent(new Event('scroll'));
		await tick();

		expect(button?.dataset.visible).toBe('true');
	});

	it('uses smooth scrolling when reduced motion is not requested', async () => {
		window.matchMedia = createMatchMedia(false);
		const { container } = render(BackToTop);
		await tick();

		setScrollY(1000);
		window.dispatchEvent(new Event('scroll'));
		await tick();

		const button = container.querySelector('[data-back-to-top]') as HTMLButtonElement;
		button.click();
		await tick();

		expect(window.scrollTo).toHaveBeenCalledWith(
			expect.objectContaining({ top: 0, left: 0, behavior: 'smooth' })
		);
	});

	it('responds to body scroll events', async () => {
		const { container } = render(BackToTop);
		await tick();

		setBodyScrollTop(1000);
		document.body.dispatchEvent(new Event('scroll'));
		await tick();

		const button = container.querySelector('[data-back-to-top]') as HTMLButtonElement;
		expect(button.dataset.visible).toBe('true');
	});
});

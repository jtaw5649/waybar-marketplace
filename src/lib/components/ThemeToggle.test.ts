// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

const mockThemeStore = vi.hoisted(() => ({
	current: 'system' as 'system' | 'light' | 'dark',
	cycle: vi.fn()
}));

vi.mock('$lib/stores/theme', () => ({
	theme: {
		subscribe: (fn: (value: string) => void) => {
			fn(mockThemeStore.current);
			return () => {};
		},
		cycle: mockThemeStore.cycle
	}
}));

vi.mock('svelte/store', () => ({
	fromStore: () => mockThemeStore
}));

import ThemeToggle from './ThemeToggle.svelte';

describe('ThemeToggle', () => {
	beforeEach(() => {
		mockThemeStore.current = 'system';
		mockThemeStore.cycle.mockClear();
	});

	it('renders a button with theme toggle label', () => {
		render(ThemeToggle);

		const button = screen.getByRole('button', { name: /toggle theme/i });
		expect(button).toBeTruthy();
	});

	it('cycles through themes when clicked', async () => {
		render(ThemeToggle);

		const button = screen.getByRole('button', { name: /toggle theme/i });
		await fireEvent.click(button);

		expect(mockThemeStore.cycle).toHaveBeenCalled();
	});

	it('has pill-shaped styling with glassmorphism', () => {
		render(ThemeToggle);

		const button = screen.getByRole('button', { name: /toggle theme/i });
		expect(button.classList.contains('theme-toggle')).toBe(true);
	});

	it('wraps icon in animated wrapper for rotation effect', () => {
		render(ThemeToggle);

		const wrapper = document.querySelector('.icon-wrapper');
		expect(wrapper).toBeTruthy();
	});
});

// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockOpen } = vi.hoisted(() => {
	const mockOpen = vi.fn();
	return { mockOpen };
});

vi.mock('$lib/stores/commandPalette', () => ({
	open: mockOpen
}));

vi.mock('svelte-typewrite', () => ({
	TypeWriter: () => null
}));

import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import SearchInput from './SearchInput.svelte';

describe('SearchInput', () => {
	beforeEach(() => {
		mockOpen.mockClear();
	});

	it('renders typewriter placeholder text', async () => {
		const { container } = render(SearchInput);

		const placeholder = container.querySelector('.search-placeholder');
		expect(placeholder).toBeTruthy();
		expect(placeholder?.textContent?.length).toBeGreaterThan(0);
	});

	it('renders shortcut hint keys using Kbd components', () => {
		const { container } = render(SearchInput);

		const keys = container.querySelectorAll('.search-shortcut [data-slot="kbd"]');
		expect(keys.length).toBe(3);
	});

	it('opens command palette when clicked', async () => {
		const { container } = render(SearchInput);

		const button = container.querySelector('button');
		button?.click();
		await tick();

		expect(mockOpen).toHaveBeenCalledTimes(1);
	});
});

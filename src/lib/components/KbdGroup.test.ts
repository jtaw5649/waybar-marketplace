// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import KbdGroup from './KbdGroup.svelte';

describe('KbdGroup', () => {
	it('renders a group wrapper with slot content', () => {
		const snippet = createRawSnippet(() => ({ render: () => '<span>⌘K</span>' }));
		const { container } = render(KbdGroup, {
			props: { children: snippet }
		});

		const group = container.querySelector('[data-slot="kbd-group"]');
		expect(group).toBeTruthy();
		expect(group?.textContent?.includes('⌘')).toBe(true);
	});

	it('merges custom class names', () => {
		const snippet = createRawSnippet(() => ({ render: () => '<span>K</span>' }));
		const { container } = render(KbdGroup, {
			props: { class: 'custom', children: snippet }
		});

		const group = container.querySelector('[data-slot="kbd-group"]');
		expect(group?.className.includes('custom')).toBe(true);
	});
});

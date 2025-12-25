// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Kbd from './Kbd.svelte';

describe('Kbd', () => {
	it('renders a kbd element with slot content', () => {
		const snippet = createRawSnippet(() => ({ render: () => '<span>⌘</span>' }));
		const { container } = render(Kbd, {
			props: { children: snippet }
		});

		const el = container.querySelector('[data-slot="kbd"]');
		expect(el?.tagName).toBe('KBD');
		expect(el?.textContent).toBe('⌘');
	});

	it('merges custom class names', () => {
		const snippet = createRawSnippet(() => ({ render: () => '<span>K</span>' }));
		const { container } = render(Kbd, {
			props: { class: 'custom', children: snippet }
		});

		const el = container.querySelector('[data-slot="kbd"]');
		expect(el?.className.includes('custom')).toBe(true);
	});

	it('applies ghost class when variant is ghost', () => {
		const snippet = createRawSnippet(() => ({ render: () => '<span>❖</span>' }));
		const { container } = render(Kbd, {
			props: { variant: 'ghost', children: snippet }
		});

		const el = container.querySelector('[data-slot="kbd"]');
		expect(el?.classList.contains('ghost')).toBe(true);
	});
});

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Icon from './Icon.svelte';

describe('Icon SSR', () => {
	it('renders brand icon markup during SSR', () => {
		const { html } = render(Icon, {
			props: { name: 'simple-icons:github', ariaLabel: 'GitHub' }
		});

		expect(html).toContain('<svg');
		expect(html).toContain('aria-label="GitHub"');
	});
});

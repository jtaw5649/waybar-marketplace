// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Icon from './Icon.svelte';

describe('Icon', () => {
	it('renders logo svg with aria label', () => {
		const { container } = render(Icon, { name: 'logo', ariaLabel: 'Barforge' });
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('aria-label')).toBe('Barforge');
	});

	it('renders brand icon with aria label', () => {
		const { container } = render(Icon, { name: 'simple-icons:github', ariaLabel: 'GitHub' });
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('aria-label')).toBe('GitHub');
	});
});

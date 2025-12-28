// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Avatar from './Avatar.svelte';

describe('Avatar', () => {
	it('sets width and height for the sm size', () => {
		const { container } = render(Avatar, {
			src: 'https://example.com/avatar.png',
			size: 'sm',
			name: 'Nova'
		});

		const img = container.querySelector('img');
		expect(img?.getAttribute('width')).toBe('24');
		expect(img?.getAttribute('height')).toBe('24');
	});

	it('sets width and height for the md size', () => {
		const { container } = render(Avatar, {
			src: 'https://example.com/avatar.png',
			size: 'md',
			name: 'Nova'
		});

		const img = container.querySelector('img');
		expect(img?.getAttribute('width')).toBe('32');
		expect(img?.getAttribute('height')).toBe('32');
	});

	it('sets width and height for the lg size', () => {
		const { container } = render(Avatar, {
			src: 'https://example.com/avatar.png',
			size: 'lg',
			name: 'Nova'
		});

		const img = container.querySelector('img');
		expect(img?.getAttribute('width')).toBe('48');
		expect(img?.getAttribute('height')).toBe('48');
	});

	it('sets width and height for the xl size', () => {
		const { container } = render(Avatar, {
			src: 'https://example.com/avatar.png',
			size: 'xl',
			name: 'Nova'
		});

		const img = container.querySelector('img');
		expect(img?.getAttribute('width')).toBe('120');
		expect(img?.getAttribute('height')).toBe('120');
	});
});

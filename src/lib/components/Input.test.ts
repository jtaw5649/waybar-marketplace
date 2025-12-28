// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Input from './Input.svelte';

describe('Input', () => {
	it('passes autocomplete attribute through to the input element', () => {
		render(Input, {
			props: {
				id: 'email',
				name: 'email',
				type: 'email',
				autocomplete: 'email'
			}
		});

		const input = screen.getByRole('textbox');
		expect(input.getAttribute('autocomplete')).toBe('email');
	});
});

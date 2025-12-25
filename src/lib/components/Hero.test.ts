// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Hero from './Hero.svelte';

describe('Hero', () => {
	it('renders hero with layout-focused copy, CTAs, and command snippet', () => {
		render(Hero);

		expect(screen.getByRole('heading', { name: /start with a working bar/i })).toBeTruthy();
		expect(screen.getByText(/install barforge, apply a layout, and tune your files/i)).toBeTruthy();

		const installLink = screen.getByRole('link', { name: /install barforge/i });
		expect(installLink.getAttribute('href')).toBe('#install');
		const workflowLink = screen.getByRole('link', { name: /see it in action/i });
		expect(workflowLink.getAttribute('href')).toBe('#workflow');

		expect(screen.getByText(/barforge apply/i)).toBeTruthy();
		expect(screen.getByLabelText(/copy to clipboard/i)).toBeTruthy();

		const heroGrid = document.querySelector('.hero-grid');
		const heroGlow = document.querySelector('.hero-glow');
		expect(heroGrid?.getAttribute('aria-hidden')).toBe('true');
		expect(heroGlow?.getAttribute('aria-hidden')).toBe('true');
	});
});

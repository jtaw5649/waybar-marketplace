// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

const mockStars = vi.hoisted(() => ({
	isStarred: vi.fn().mockReturnValue(false),
	toggle: vi.fn()
}));

vi.mock('$lib/stores/stars.svelte', () => ({
	stars: mockStars
}));

import StarFavorite from './StarFavorite.svelte';

describe('StarFavorite', () => {
	beforeEach(() => {
		mockStars.isStarred.mockReturnValue(false);
		mockStars.toggle.mockClear();
	});

	it('renders a star button', () => {
		render(StarFavorite, { props: { uuid: 'test-uuid' } });

		const button = screen.getByRole('button', { name: /add to stars/i });
		expect(button).toBeTruthy();
	});
});

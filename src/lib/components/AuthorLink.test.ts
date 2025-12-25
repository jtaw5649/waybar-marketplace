// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AuthorLink from './AuthorLink.svelte';
import { userCache } from '$lib/stores/userCache.svelte';

describe('AuthorLink', () => {
	beforeEach(() => {
		userCache.clear();
		vi.resetAllMocks();
	});

	it('renders username as link', () => {
		render(AuthorLink, { props: { username: 'testauthor' } });

		const link = screen.getByRole('link');
		expect(link.textContent).toBe('testauthor');
		expect(link.getAttribute('href')).toBe('/users/testauthor');
	});

	it('wraps link in hover card', () => {
		render(AuthorLink, { props: { username: 'hovertest' } });

		const wrapper = document.querySelector('.hover-card-wrapper');
		expect(wrapper).toBeTruthy();
	});
});

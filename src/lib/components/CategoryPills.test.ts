// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CategoryPills from './CategoryPills.svelte';
import type { Category } from '$lib/constants/categories';

const mockCategories: Category[] = [
	{ name: 'System', slug: 'system', icon: '/icons/category-system.svg', color: '#617dfa' },
	{ name: 'Network', slug: 'network', icon: '/icons/category-network.svg', color: '#f59e0b' }
];

describe('CategoryPills', () => {
	it('renders category pills with correct names', () => {
		render(CategoryPills, { props: { categories: mockCategories } });

		expect(screen.getByText('System')).toBeTruthy();
		expect(screen.getByText('Network')).toBeTruthy();
	});

	it('renders links with default baseUrl /modules/search', () => {
		render(CategoryPills, { props: { categories: mockCategories } });

		const systemLink = screen.getByRole('link', { name: /system/i });
		expect(systemLink.getAttribute('href')).toBe('/modules/search?category=system');
	});

	it('renders links with custom baseUrl', () => {
		render(CategoryPills, { props: { categories: mockCategories, baseUrl: '/modules' } });

		const networkLink = screen.getByRole('link', { name: /network/i });
		expect(networkLink.getAttribute('href')).toBe('/modules?category=network');
	});

	it('renders category icons', () => {
		render(CategoryPills, { props: { categories: mockCategories } });

		const icons = document.querySelectorAll('.category-pill img');
		expect(icons.length).toBe(2);
		expect((icons[0] as HTMLImageElement).src).toContain('category-system.svg');
	});

	it('applies category color as CSS custom property', () => {
		render(CategoryPills, { props: { categories: mockCategories } });

		const pill = document.querySelector('.category-pill') as HTMLElement;
		expect(pill.style.getPropertyValue('--cat-color')).toBe('#617dfa');
	});
});

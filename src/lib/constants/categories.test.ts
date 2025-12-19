import { describe, it, expect } from 'vitest';
import {
	CATEGORIES,
	getCategorySlugs,
	getBrowseCategories,
	getHomepageCategories,
	getCategoryBySlug,
	getCategoryName
} from './categories';

describe('CATEGORIES', () => {
	it('contains all expected categories', () => {
		const slugs = CATEGORIES.map((c) => c.slug);
		expect(slugs).toContain('system');
		expect(slugs).toContain('hardware');
		expect(slugs).toContain('network');
		expect(slugs).toContain('media');
		expect(slugs).toContain('custom');
	});

	it('has required properties for each category', () => {
		for (const category of CATEGORIES) {
			expect(category.name).toBeTruthy();
			expect(category.slug).toBeTruthy();
			expect(category.icon).toMatch(/^\/icons\/category-.+\.svg$/);
			expect(category.color).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});

	it('has unique slugs', () => {
		const slugs = CATEGORIES.map((c) => c.slug);
		const uniqueSlugs = new Set(slugs);
		expect(uniqueSlugs.size).toBe(slugs.length);
	});
});

describe('getCategorySlugs', () => {
	it('returns array of all slugs', () => {
		const slugs = getCategorySlugs();
		expect(slugs).toHaveLength(CATEGORIES.length);
		expect(slugs).toContain('system');
		expect(slugs).toContain('custom');
	});
});

describe('getBrowseCategories', () => {
	it('includes "All" option at the start', () => {
		const browse = getBrowseCategories();
		expect(browse[0]).toEqual({ name: 'All', slug: '' });
	});

	it('includes all categories after "All"', () => {
		const browse = getBrowseCategories();
		expect(browse).toHaveLength(CATEGORIES.length + 1);
	});

	it('returns only name and slug properties', () => {
		const browse = getBrowseCategories();
		for (const cat of browse) {
			expect(Object.keys(cat)).toEqual(['name', 'slug']);
		}
	});
});

describe('getHomepageCategories', () => {
	it('returns featured subset of categories', () => {
		const homepage = getHomepageCategories();
		expect(homepage.length).toBeLessThan(CATEGORIES.length);
		expect(homepage.length).toBe(6);
	});

	it('includes expected featured categories', () => {
		const homepage = getHomepageCategories();
		const slugs = homepage.map((c) => c.slug);
		expect(slugs).toContain('system');
		expect(slugs).toContain('hardware');
		expect(slugs).toContain('network');
		expect(slugs).toContain('media');
		expect(slugs).toContain('workspace');
		expect(slugs).toContain('clock');
	});

	it('returns full category objects with icons and colors', () => {
		const homepage = getHomepageCategories();
		for (const cat of homepage) {
			expect(cat.icon).toBeTruthy();
			expect(cat.color).toBeTruthy();
		}
	});
});

describe('getCategoryBySlug', () => {
	it('finds category by exact slug', () => {
		const system = getCategoryBySlug('system');
		expect(system?.name).toBe('System');
		expect(system?.color).toBe('#617dfa');
	});

	it('is case-insensitive', () => {
		const system = getCategoryBySlug('SYSTEM');
		expect(system?.name).toBe('System');
	});

	it('returns undefined for unknown slug', () => {
		const unknown = getCategoryBySlug('nonexistent');
		expect(unknown).toBeUndefined();
	});
});

describe('getCategoryName', () => {
	it('returns display name for valid slug', () => {
		expect(getCategoryName('system')).toBe('System');
		expect(getCategoryName('hardware')).toBe('Hardware');
	});

	it('returns slug as fallback for unknown category', () => {
		expect(getCategoryName('unknown-category')).toBe('unknown-category');
	});

	it('is case-insensitive', () => {
		expect(getCategoryName('MEDIA')).toBe('Media');
	});
});

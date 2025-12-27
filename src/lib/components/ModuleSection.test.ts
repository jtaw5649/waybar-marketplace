// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ModuleSection from './ModuleSection.svelte';
import type { Module } from '$lib/types';

const mockModules = [
	{
		uuid: 'mod-1',
		name: 'Battery Widget',
		description: 'A battery indicator',
		author: 'test',
		category: 'system',
		downloads: 100,
		rating: 4.5,
		verified_author: false,
		repo_url: 'https://example.com/battery',
		tags: [],
		last_updated: '2024-01-01'
	},
	{
		uuid: 'mod-2',
		name: 'CPU Monitor',
		description: 'CPU usage display',
		author: 'test',
		category: 'system',
		downloads: 200,
		rating: 4.0,
		verified_author: false,
		repo_url: 'https://example.com/cpu',
		tags: [],
		last_updated: '2024-01-02'
	}
] as Module[];

describe('ModuleSection', () => {
	it('renders section title and subtitle', () => {
		render(ModuleSection, {
			props: {
				title: 'Featured Modules',
				subtitle: 'Hand-picked by our team',
				modules: []
			}
		});

		expect(screen.getByRole('heading', { name: 'Featured Modules' })).toBeTruthy();
		expect(screen.getByText('Hand-picked by our team')).toBeTruthy();
	});

	it('renders see all link when seeAllUrl provided', () => {
		render(ModuleSection, {
			props: {
				title: 'Popular',
				subtitle: 'Top downloads',
				modules: [],
				seeAllUrl: '/modules/search?sort=popular'
			}
		});

		const link = screen.getByRole('link', { name: /see all/i });
		expect(link.getAttribute('href')).toBe('/modules/search?sort=popular');
	});

	it('renders module cards in grid', () => {
		render(ModuleSection, {
			props: {
				title: 'Featured',
				subtitle: 'Best picks',
				modules: mockModules
			}
		});

		expect(screen.getByText('Battery Widget')).toBeTruthy();
		expect(screen.getByText('CPU Monitor')).toBeTruthy();
	});
});

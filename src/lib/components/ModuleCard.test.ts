// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ModuleCard from './ModuleCard.svelte';

describe('ModuleCard', () => {
	it('adds an accessible label to the module link', () => {
		render(ModuleCard, {
			uuid: 'module-123',
			name: 'Transit Tracker',
			author: 'Jordan',
			description: 'Track nearby trains',
			category: 'Transport',
			downloads: 1200,
			lastUpdated: '2024-12-02'
		});

		const link = screen.getByRole('link', { name: /view transit tracker module/i });
		expect(link.getAttribute('aria-label')).toBe('View Transit Tracker module');
	});

	it('wraps module icons in a framed container', () => {
		const { container } = render(ModuleCard, {
			uuid: 'module-456',
			name: 'Barforge Essentials',
			author: 'Nova',
			description: 'Essentials pack',
			category: 'System',
			downloads: 540,
			icon: '/icons/barforge.svg',
			lastUpdated: '2024-12-10'
		});

		const frame = container.querySelector('.card-icon-frame');
		expect(frame).toBeTruthy();
		expect(frame?.querySelector('img')).toBeTruthy();
	});

	it('renders author with hover card', () => {
		const { container } = render(ModuleCard, {
			uuid: 'module-789',
			name: 'Hover Module',
			author: 'hovertest',
			description: 'Test hover',
			category: 'Utility',
			downloads: 100,
			lastUpdated: '2024-12-08'
		});

		const hoverWrapper = container.querySelector('.hover-card-wrapper');
		expect(hoverWrapper).toBeTruthy();
	});
});

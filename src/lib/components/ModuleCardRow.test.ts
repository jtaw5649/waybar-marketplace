// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import ModuleCardRow from './ModuleCardRow.svelte';

describe('ModuleCardRow', () => {
	it('wraps row icons in a framed container', () => {
		const { container } = render(ModuleCardRow, {
			uuid: 'row-123',
			name: 'Focus Pulse',
			author: 'Riley',
			category: 'Productivity',
			downloads: 320,
			icon: '/icons/focus.svg',
			createdAt: '2024-12-08'
		});

		const frame = container.querySelector('.row-icon-frame');
		expect(frame).toBeTruthy();
		expect(frame?.querySelector('img')).toBeTruthy();
	});

	it('renders author with hover card', () => {
		const { container } = render(ModuleCardRow, {
			uuid: 'row-456',
			name: 'Hover Test',
			author: 'hoverauthor',
			category: 'Utility',
			downloads: 100,
			createdAt: '2024-12-08'
		});

		const hoverWrapper = container.querySelector('.hover-card-wrapper');
		expect(hoverWrapper).toBeTruthy();
	});
});

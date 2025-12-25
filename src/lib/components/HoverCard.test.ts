// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import HoverCard from './HoverCard.svelte';

describe('HoverCard', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it('renders trigger content', () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		expect(screen.getByText('Hover me')).toBeTruthy();
	});

	it('does not show content initially', () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		expect(screen.queryByText('Card content')).toBeNull();
	});

	it('shows content after hover delay', async () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.mouseEnter(trigger);

		vi.advanceTimersByTime(200);
		await vi.runAllTimersAsync();

		expect(screen.getByText('Card content')).toBeTruthy();
	});

	it('does not show content if mouse leaves before delay', async () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.mouseEnter(trigger);
		vi.advanceTimersByTime(100);
		await fireEvent.mouseLeave(trigger);
		vi.advanceTimersByTime(200);

		expect(screen.queryByText('Card content')).toBeNull();
	});

	it('hides content after mouse leaves with grace period', async () => {
		vi.useRealTimers();

		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content',
				delay: 50,
				closeDelay: 50
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.mouseEnter(trigger);

		await waitFor(() => {
			expect(screen.getByText('Card content')).toBeTruthy();
		});

		await fireEvent.mouseLeave(trigger);

		await waitFor(() => {
			expect(screen.queryByText('Card content')).toBeNull();
		});
	});

	it('stays open when mouse moves to card content', async () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.mouseEnter(trigger);
		vi.advanceTimersByTime(200);
		await vi.runAllTimersAsync();

		const card = screen.getByText('Card content').closest('.hover-card');
		await fireEvent.mouseLeave(trigger);
		await fireEvent.mouseEnter(card!);

		vi.advanceTimersByTime(200);

		expect(screen.getByText('Card content')).toBeTruthy();
	});

	it('closes on Escape key', async () => {
		vi.useRealTimers();

		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText('Card content')).toBeTruthy();
		});

		await fireEvent.keyDown(window, { key: 'Escape' });

		await waitFor(() => {
			expect(screen.queryByText('Card content')).toBeNull();
		});
	});

	it('closes on click outside', async () => {
		vi.useRealTimers();

		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText('Card content')).toBeTruthy();
		});

		const outside = document.createElement('div');
		document.body.appendChild(outside);
		await fireEvent.click(outside);

		await waitFor(() => {
			expect(screen.queryByText('Card content')).toBeNull();
		});

		document.body.removeChild(outside);
	});

	it('toggles on click for touch devices', async () => {
		vi.useRealTimers();

		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.getByText('Card content')).toBeTruthy();
		});

		await fireEvent.click(trigger);

		await waitFor(() => {
			expect(screen.queryByText('Card content')).toBeNull();
		});
	});

	it('has correct aria attributes on trigger', () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me').closest('[aria-haspopup]');
		expect(trigger?.getAttribute('aria-haspopup')).toBe('true');
		expect(trigger?.getAttribute('aria-expanded')).toBe('false');
	});

	it('updates aria-expanded when open', async () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me').closest('[aria-haspopup]');
		await fireEvent.mouseEnter(trigger!);
		vi.advanceTimersByTime(200);
		await vi.runAllTimersAsync();

		expect(trigger?.getAttribute('aria-expanded')).toBe('true');
	});

	it('applies hover-card class to content container', async () => {
		render(HoverCard, {
			props: {
				triggerText: 'Hover me',
				contentText: 'Card content'
			}
		});

		const trigger = screen.getByText('Hover me');
		await fireEvent.mouseEnter(trigger);
		vi.advanceTimersByTime(200);
		await vi.runAllTimersAsync();

		const card = screen.getByText('Card content').closest('.hover-card');
		expect(card).toBeTruthy();
	});
});

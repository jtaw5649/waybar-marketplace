// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import InstallSnippet from './InstallSnippet.svelte';

describe('InstallSnippet', () => {
	beforeEach(() => {
		Object.assign(navigator, {
			clipboard: {
				writeText: vi.fn().mockResolvedValue(undefined)
			}
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('has install-snippet class for overflow styling', () => {
		render(InstallSnippet);

		const section = document.querySelector('.install-snippet');
		expect(section).toBeTruthy();
		expect(section?.classList.contains('install-snippet')).toBe(true);
	});

	it('renders all three tabs with correct labels', () => {
		render(InstallSnippet);

		expect(screen.getByRole('tab', { name: /shell/i })).toBeTruthy();
		expect(screen.getByRole('tab', { name: /aur/i })).toBeTruthy();
		expect(screen.getByRole('tab', { name: /source/i })).toBeTruthy();
	});

	it('has AUR tab active by default', () => {
		render(InstallSnippet);

		const aurTab = screen.getByRole('tab', { name: /aur/i });
		expect(aurTab.getAttribute('aria-selected')).toBe('true');
	});

	it('switches command when clicking AUR tab', async () => {
		render(InstallSnippet);

		const aurTab = screen.getByRole('tab', { name: /aur/i });
		await fireEvent.click(aurTab);

		expect(screen.getByText(/yay -S barforge/)).toBeTruthy();
		expect(aurTab.getAttribute('aria-selected')).toBe('true');
	});

	it('has copy button that copies command to clipboard', async () => {
		render(InstallSnippet);

		const copyButton = screen.getByRole('button', { name: /copy/i });
		await fireEvent.click(copyButton);

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('yay'));
	});

	it('expands command on click, collapses on second click', async () => {
		render(InstallSnippet);

		const terminalBody = screen.getByRole('tabpanel').querySelector('.terminal-body');
		const cmd = screen.getByRole('tabpanel').querySelector('.terminal-cmd');

		expect(cmd?.classList.contains('show-full')).toBe(false);

		await fireEvent.click(terminalBody!);
		expect(cmd?.classList.contains('show-full')).toBe(true);

		await fireEvent.click(terminalBody!);
		expect(cmd?.classList.contains('show-full')).toBe(false);
	});

	it('copy button click does not toggle expand state', async () => {
		render(InstallSnippet);

		const copyButton = screen.getByRole('button', { name: /copy/i });
		const cmd = screen.getByRole('tabpanel').querySelector('.terminal-cmd');

		expect(cmd?.classList.contains('show-full')).toBe(false);

		await fireEvent.click(copyButton);

		expect(cmd?.classList.contains('show-full')).toBe(false);
	});

	it('shows full command on hover, hides on mouse leave', async () => {
		render(InstallSnippet);

		const terminalBody = screen.getByRole('tabpanel').querySelector('.terminal-body');
		const cmd = screen.getByRole('tabpanel').querySelector('.terminal-cmd');

		expect(cmd?.classList.contains('show-full')).toBe(false);

		await fireEvent.mouseEnter(terminalBody!);
		expect(cmd?.classList.contains('show-full')).toBe(true);

		await fireEvent.mouseLeave(terminalBody!);
		expect(cmd?.classList.contains('show-full')).toBe(false);
	});

	it('keeps expanded when locked via click even after mouse leave', async () => {
		render(InstallSnippet);

		const terminalBody = screen.getByRole('tabpanel').querySelector('.terminal-body');
		const cmd = screen.getByRole('tabpanel').querySelector('.terminal-cmd');

		await fireEvent.click(terminalBody!);
		expect(cmd?.classList.contains('show-full')).toBe(true);

		await fireEvent.mouseLeave(terminalBody!);
		expect(cmd?.classList.contains('show-full')).toBe(true);
	});

	it('toggles expand on Enter key press for keyboard accessibility', async () => {
		render(InstallSnippet);

		const terminalBody = screen.getByRole('button', { name: /toggle command expansion/i });
		const cmd = screen.getByRole('tabpanel').querySelector('.terminal-cmd');

		expect(cmd?.classList.contains('show-full')).toBe(false);

		await fireEvent.keyDown(terminalBody, { key: 'Enter' });
		expect(cmd?.classList.contains('show-full')).toBe(true);

		await fireEvent.keyDown(terminalBody, { key: 'Enter' });
		expect(cmd?.classList.contains('show-full')).toBe(false);
	});

	it('copies command with Ctrl+C keyboard shortcut only when mouse is in section', async () => {
		render(InstallSnippet);

		const section = document.querySelector('.install-snippet');

		await fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
		expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

		await fireEvent.mouseEnter(section!);
		await fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('yay'));
	});

	it('only responds to Ctrl+C, not Meta+C alone', async () => {
		render(InstallSnippet);

		const section = document.querySelector('.install-snippet');
		await fireEvent.mouseEnter(section!);

		vi.mocked(navigator.clipboard.writeText).mockClear();
		await fireEvent.keyDown(window, { key: 'c', metaKey: true, ctrlKey: false });
		expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
	});

	it('displays Ctrl as the keyboard shortcut modifier', () => {
		render(InstallSnippet);

		const kbdElements = document.querySelectorAll('[data-slot="kbd"]');
		const kbdTexts = Array.from(kbdElements).map((el) => el.textContent);
		expect(kbdTexts).toContain('Ctrl');
	});
});

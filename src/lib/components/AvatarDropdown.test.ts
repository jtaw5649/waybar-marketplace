// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

const mocks = vi.hoisted(() => ({
	signOutWithCleanup: vi.fn()
}));

vi.mock('$lib/utils/sessionCleanup', () => ({
	signOutWithCleanup: mocks.signOutWithCleanup
}));
import AvatarDropdown from './AvatarDropdown.svelte';

const user = { name: 'Nova', email: 'nova@example.com', image: 'https://example.com/avatar.png' };

describe('AvatarDropdown', () => {
	it('renders a menu trigger button', () => {
		render(AvatarDropdown, { user });
		expect(screen.getByRole('button', { name: /open user menu/i })).toBeTruthy();
	});

	it('opens and closes the dropdown', async () => {
		render(AvatarDropdown, { user });

		const trigger = screen.getByRole('button', { name: /open user menu/i });
		await fireEvent.click(trigger);
		expect(screen.getByRole('menu')).toBeTruthy();

		await fireEvent.click(document.body);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('closes on escape key', async () => {
		render(AvatarDropdown, { user });

		const trigger = screen.getByRole('button', { name: /open user menu/i });
		await fireEvent.click(trigger);
		expect(screen.getByRole('menu')).toBeTruthy();

		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('shows menu items and logs out', async () => {
		render(AvatarDropdown, { user });

		const trigger = screen.getByRole('button', { name: /open user menu/i });
		await fireEvent.click(trigger);

		expect(screen.getByRole('menuitem', { name: /your modules/i })).toBeTruthy();
		expect(screen.getByRole('menuitem', { name: /settings/i })).toBeTruthy();
		expect(screen.getByRole('menuitem', { name: /your stars/i })).toBeTruthy();

		const logOutButton = screen.getByRole('menuitem', { name: /log out/i });
		await fireEvent.click(logOutButton);
		expect(mocks.signOutWithCleanup).toHaveBeenCalled();
	});

	it('shows large avatar next to name in dropdown header', async () => {
		render(AvatarDropdown, { user });

		const trigger = screen.getByRole('button', { name: /open user menu/i });
		await fireEvent.click(trigger);

		const header = document.querySelector('.dropdown-header');
		expect(header).toBeTruthy();
		const avatar = header?.querySelector('.avatar-lg');
		expect(avatar).toBeTruthy();
		expect(screen.getByText('Nova')).toBeTruthy();
	});

	it('displays icons next to menu items', async () => {
		render(AvatarDropdown, { user });

		const trigger = screen.getByRole('button', { name: /open user menu/i });
		await fireEvent.click(trigger);

		const menuItems = document.querySelectorAll('.dropdown-section a');
		menuItems.forEach((item) => {
			expect(item.querySelector('svg')).toBeTruthy();
		});
	});
});

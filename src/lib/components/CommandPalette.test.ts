// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$lib', () => ({
	API_BASE_URL: 'https://api.example.com'
}));

vi.mock('$lib/stores/commandPalette', () => {
	const isOpen = {
		subscribe: vi.fn((fn) => {
			fn(true);
			return () => {};
		})
	};
	const mode = {
		subscribe: vi.fn((fn) => {
			fn('pages');
			return () => {};
		})
	};
	const query = {
		subscribe: vi.fn((fn) => {
			fn('');
			return () => {};
		})
	};
	const modules = {
		subscribe: vi.fn((fn) => {
			fn([]);
			return () => {};
		})
	};
	return {
		isOpen,
		mode,
		query,
		modules,
		close: vi.fn(),
		setMode: vi.fn(),
		setQuery: vi.fn(),
		setModules: vi.fn()
	};
});

const createSession = (name: string) => ({
	user: { name, login: name },
	expires: new Date(Date.now() + 86400000).toISOString()
});

describe('CommandPalette auth filtering', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('hides admin panel for non-admin users', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		const session = createSession('testuser');
		render(CommandPalette, { session, isAdmin: false });

		expect(screen.queryByText('Admin Panel')).toBeNull();
	});

	it('shows admin panel for admin users', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		const session = createSession('admin');
		render(CommandPalette, { session, isAdmin: true });

		expect(screen.getByText('Admin Panel')).toBeTruthy();
	});

	it('hides upload and dashboard for unauthenticated users', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		render(CommandPalette, { session: null, isAdmin: false });

		expect(screen.queryByText('Upload Module')).toBeNull();
		expect(screen.queryByText('Dashboard')).toBeNull();
	});

	it('shows dashboard for authenticated users', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		const session = createSession('testuser');
		render(CommandPalette, { session, isAdmin: false });

		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.queryByText('Upload Module')).toBeNull();
	});

	it('hides login for authenticated users', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		const session = createSession('testuser');
		render(CommandPalette, { session, isAdmin: false });

		expect(screen.queryByText('Login')).toBeNull();
	});

	it('shows login for unauthenticated users', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		render(CommandPalette, { session: null, isAdmin: false });

		expect(screen.getByText('Login')).toBeTruthy();
	});

	it('uses neutral copy for the command input and results', async () => {
		const { default: CommandPalette } = await import('./CommandPalette.svelte');
		render(CommandPalette, { session: null, isAdmin: false });

		const input = screen.getByRole('combobox');
		expect(input.getAttribute('placeholder')).toBe('Find pages and commands...');
		expect(input.getAttribute('aria-label')).toBe('Find pages and commands');

		const results = screen.getByRole('listbox');
		expect(results.getAttribute('aria-label')).toBe('Results');
	});
});

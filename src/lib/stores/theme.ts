import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'dark';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
	if (!browser) return 'system';
	const stored = localStorage.getItem('theme');
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return 'system';
}

function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
	return theme === 'system' ? getSystemTheme() : theme;
}

function createThemeStore() {
	const initial = getStoredTheme();
	const { subscribe, set } = writable<Theme>(initial);
	let mediaQuery: MediaQueryList | null = null;
	let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null;

	function applyTheme(theme: Theme) {
		if (!browser) return;
		const effective = getEffectiveTheme(theme);
		document.documentElement.setAttribute('data-theme', effective);
		localStorage.setItem('theme', theme);
	}

	if (browser) {
		applyTheme(initial);

		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQueryHandler = () => {
			const current = getStoredTheme();
			if (current === 'system') {
				applyTheme('system');
			}
		};
		mediaQuery.addEventListener('change', mediaQueryHandler);
	}

	return {
		subscribe,
		set: (theme: Theme) => {
			set(theme);
			applyTheme(theme);
		},
		toggle: () => {
			const current = getStoredTheme();
			const effective = getEffectiveTheme(current);
			const next: Theme = effective === 'dark' ? 'light' : 'dark';
			set(next);
			applyTheme(next);
		},
		setSystem: () => {
			set('system');
			applyTheme('system');
		},
		cleanup: () => {
			if (mediaQuery && mediaQueryHandler) {
				mediaQuery.removeEventListener('change', mediaQueryHandler);
			}
		}
	};
}

export const theme = createThemeStore();

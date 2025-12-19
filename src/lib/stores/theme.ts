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

	function applyTheme(theme: Theme) {
		if (!browser) return;
		const effective = getEffectiveTheme(theme);
		document.documentElement.setAttribute('data-theme', effective);
		localStorage.setItem('theme', theme);
	}

	if (browser) {
		applyTheme(initial);

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			const current = getStoredTheme();
			if (current === 'system') {
				applyTheme('system');
			}
		});
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
		}
	};
}

export const theme = createThemeStore();

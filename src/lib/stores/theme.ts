import { writable, readable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';
export type Platform = 'mac' | 'windows' | 'linux';

function detectPlatform(): Platform {
	if (!browser) return 'linux';
	const ua = navigator.userAgent.toLowerCase();
	if (ua.includes('mac')) return 'mac';
	if (ua.includes('win')) return 'windows';
	return 'linux';
}

export const platform = readable<Platform>(detectPlatform());

export function getModifierKey(p: Platform): string {
	switch (p) {
		case 'mac':
			return '⌘';
		case 'windows':
			return '⊞';
		case 'linux':
			return '❖';
	}
}

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
		cycle: () => {
			const order: Theme[] = ['system', 'light', 'dark'];
			const current = getStoredTheme();
			const currentIndex = order.indexOf(current);
			const next = order[(currentIndex + 1) % order.length];
			set(next);
			applyTheme(next);
		},
		cleanup: () => {
			if (mediaQuery && mediaQueryHandler) {
				mediaQuery.removeEventListener('change', mediaQueryHandler);
			}
		}
	};
}

export const theme = createThemeStore();

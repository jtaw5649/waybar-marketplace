import { writable } from 'svelte/store';
import type { PaletteMode, Module } from '$lib/types';

const createStore = <T>(initial: T) => {
	const { subscribe, set, update } = writable<T>(initial);
	return { subscribe, set, update, reset: () => set(initial) };
};

export const isOpen = createStore(false);
export const mode = createStore<PaletteMode>('all');
export const query = createStore('');
export const modules = createStore<Module[]>([]);

export function open() {
	query.set('');
	isOpen.set(true);
}

export function close() {
	isOpen.set(false);
}

export function toggle() {
	isOpen.update((v) => {
		if (!v) query.set('');
		return !v;
	});
}

export function setMode(newMode: PaletteMode) {
	mode.set(newMode);
}

export function setQuery(newQuery: string) {
	query.set(newQuery);
}

export function setModules(newModules: Module[]) {
	modules.set(newModules);
}

export function reset() {
	isOpen.reset();
	mode.reset();
	query.reset();
	modules.reset();
}

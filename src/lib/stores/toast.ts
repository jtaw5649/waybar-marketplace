import { writable } from 'svelte/store';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
	id: string;
	variant: ToastVariant;
	message: string;
	duration: number;
}

function createToastStore() {
	const { subscribe, update, set } = writable<ToastMessage[]>([]);

	function reset() {
		set([]);
	}

	function add(variant: ToastVariant, message: string, duration = 5000) {
		const id = crypto.randomUUID();
		update((toasts) => [...toasts, { id, variant, message, duration }]);

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}

		return id;
	}

	function remove(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => add('success', message, duration),
		error: (message: string, duration?: number) => add('error', message, duration),
		warning: (message: string, duration?: number) => add('warning', message, duration),
		info: (message: string, duration?: number) => add('info', message, duration),
		remove,
		reset
	};
}

export const toast = createToastStore();

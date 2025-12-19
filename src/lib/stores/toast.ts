import { writable } from 'svelte/store';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
	id: string;
	variant: ToastVariant;
	message: string;
	duration: number;
	startTime: number;
	remainingTime: number;
	isPaused: boolean;
}

function createToastStore() {
	const { subscribe, update, set } = writable<ToastMessage[]>([]);
	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	function reset() {
		timers.forEach((timer) => clearTimeout(timer));
		timers.clear();
		set([]);
	}

	function add(variant: ToastVariant, message: string, duration = 5000) {
		const id = crypto.randomUUID();
		const startTime = Date.now();
		update((toasts) => [
			...toasts,
			{ id, variant, message, duration, startTime, remainingTime: duration, isPaused: false }
		]);

		if (duration > 0) {
			const timer = setTimeout(() => {
				remove(id);
			}, duration);
			timers.set(id, timer);
		}

		return id;
	}

	function remove(id: string) {
		const timer = timers.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.delete(id);
		}
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	function pause(id: string) {
		update((toasts) =>
			toasts.map((t) => {
				if (t.id !== id || t.duration === 0) return t;
				const elapsed = Date.now() - t.startTime;
				const remaining = Math.max(0, t.duration - elapsed);
				const timer = timers.get(id);
				if (timer) {
					clearTimeout(timer);
					timers.delete(id);
				}
				return { ...t, isPaused: true, remainingTime: remaining };
			})
		);
	}

	function resume(id: string) {
		update((toasts) =>
			toasts.map((t) => {
				if (t.id !== id || !t.isPaused) return t;
				if (t.remainingTime > 0) {
					const timer = setTimeout(() => {
						remove(id);
					}, t.remainingTime);
					timers.set(id, timer);
				}
				return { ...t, isPaused: false, startTime: Date.now() };
			})
		);
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => add('success', message, duration),
		error: (message: string, duration?: number) => add('error', message, duration),
		warning: (message: string, duration?: number) => add('warning', message, duration),
		info: (message: string, duration?: number) => add('info', message, duration),
		remove,
		reset,
		pause,
		resume
	};
}

export const toast = createToastStore();

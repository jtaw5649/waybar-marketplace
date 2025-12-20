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

class ToastStore {
	messages = $state<ToastMessage[]>([]);
	timers = new Map<string, ReturnType<typeof setTimeout>>();

	reset() {
		this.timers.forEach((timer) => clearTimeout(timer));
		this.timers.clear();
		this.messages = [];
	}

	add(variant: ToastVariant, message: string, duration = 5000) {
		const id = crypto.randomUUID();
		const startTime = Date.now();
		this.messages.push({
			id,
			variant,
			message,
			duration,
			startTime,
			remainingTime: duration,
			isPaused: false
		});

		if (duration > 0) {
			const timer = setTimeout(() => {
				this.remove(id);
			}, duration);
			this.timers.set(id, timer);
		}

		return id;
	}

	remove(id: string) {
		const timer = this.timers.get(id);
		if (timer) {
			clearTimeout(timer);
			this.timers.delete(id);
		}
		this.messages = this.messages.filter((t) => t.id !== id);
	}

	pause(id: string) {
		this.messages = this.messages.map((t) => {
			if (t.id !== id || t.duration === 0) return t;
			const elapsed = Date.now() - t.startTime;
			const remaining = Math.max(0, t.duration - elapsed);
			const timer = this.timers.get(id);
			if (timer) {
				clearTimeout(timer);
				this.timers.delete(id);
			}
			return { ...t, isPaused: true, remainingTime: remaining };
		});
	}

	resume(id: string) {
		this.messages = this.messages.map((t) => {
			if (t.id !== id || !t.isPaused) return t;
			if (t.remainingTime > 0) {
				const timer = setTimeout(() => {
					this.remove(id);
				}, t.remainingTime);
				this.timers.set(id, timer);
			}
			return { ...t, isPaused: false, startTime: Date.now() };
		});
	}

	success(message: string, duration?: number) {
		return this.add('success', message, duration);
	}

	error(message: string, duration?: number) {
		return this.add('error', message, duration);
	}

	warning(message: string, duration?: number) {
		return this.add('warning', message, duration);
	}

	info(message: string, duration?: number) {
		return this.add('info', message, duration);
	}
}

export const toast = new ToastStore();

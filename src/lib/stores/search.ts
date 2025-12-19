let focusCallback: (() => void) | null = null;

export function registerSearchInput(callback: () => void) {
	focusCallback = callback;
}

export function unregisterSearchInput() {
	focusCallback = null;
}

export function focusSearchInput() {
	focusCallback?.();
}

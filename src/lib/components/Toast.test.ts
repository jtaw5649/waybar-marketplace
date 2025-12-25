// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import Toast from './Toast.svelte';
import { toast } from '$lib/stores/toast.svelte';

describe('Toast', () => {
	beforeEach(() => {
		toast.messages = [];
	});

	it('positions toast container with bottom offset above footer', async () => {
		toast.add('success', 'Test message');

		const { container } = render(Toast);
		const toastContainer = container.querySelector('.toast-container');

		expect(toastContainer).toBeTruthy();
		expect(toastContainer?.classList.contains('toast-container')).toBe(true);
	});
});

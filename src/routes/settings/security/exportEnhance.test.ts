import { describe, expect, it, vi } from 'vitest';
import { handleExportResult } from './exportEnhance';

describe('handleExportResult', () => {
	it('treats redirect results as success', async () => {
		const onSuccess = vi.fn();
		const onError = vi.fn();
		const update = vi.fn().mockResolvedValue(undefined);

		await handleExportResult(
			{ type: 'redirect', location: '/settings/security' },
			update,
			onSuccess,
			onError
		);

		expect(onSuccess).toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
		expect(update).toHaveBeenCalledWith({ reset: false });
	});

	it('surfaces failure messages', async () => {
		const onSuccess = vi.fn();
		const onError = vi.fn();
		const update = vi.fn().mockResolvedValue(undefined);

		await handleExportResult(
			{ type: 'failure', data: { message: 'Export failed' } },
			update,
			onSuccess,
			onError
		);

		expect(onSuccess).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledWith('Export failed');
		expect(update).toHaveBeenCalledWith({ reset: false });
	});
});

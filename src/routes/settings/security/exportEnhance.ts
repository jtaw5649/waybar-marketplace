type ExportActionResult = {
	type: 'success' | 'failure' | 'redirect' | 'error';
	data?: { message?: string };
	location?: string;
};

type UpdateFn = (options?: { reset?: boolean }) => Promise<void> | void;

export async function handleExportResult(
	result: ExportActionResult,
	update: UpdateFn,
	onSuccess: () => void,
	onError: (message: string) => void
): Promise<void> {
	if (result.type === 'success' || result.type === 'redirect') {
		onSuccess();
	} else if (result.type === 'failure' && result.data?.message) {
		onError(result.data.message);
	}

	await update({ reset: false });
}

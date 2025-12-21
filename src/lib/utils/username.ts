export function normalizeUsername(value: string | null | undefined): string {
	return value ? value.toLowerCase().replace(/[^a-z0-9-]/g, '-') : '';
}

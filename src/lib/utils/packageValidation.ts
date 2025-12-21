export const MAX_PACKAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_PACKAGE_EXTENSIONS = ['.tar.gz', '.tgz'];

export function isAllowedPackageExtension(name: string): boolean {
	const lower = name.toLowerCase();
	return ALLOWED_PACKAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isPackageSizeAllowed(size: number): boolean {
	return size <= MAX_PACKAGE_BYTES;
}

export function encodeModuleUuid(value: string): string {
	return encodeURIComponent(value).replace(/%40/g, '@');
}

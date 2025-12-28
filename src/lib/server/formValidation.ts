import type { ZodError, ZodSchema } from 'zod';

type ParseResult<T> =
	| { success: true; data: T }
	| { success: false; errors: Record<string, string> };

export function parseFormData<T>(formData: FormData, schema: ZodSchema<T>): ParseResult<T> {
	const data: Record<string, unknown> = {};
	for (const [key, value] of formData.entries()) {
		data[key] = value;
	}
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, errors: formatZodErrors(result.error) };
}

export function parseJson<T>(data: unknown, schema: ZodSchema<T>): ParseResult<T> {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}
	return { success: false, errors: formatZodErrors(result.error) };
}

export function formatZodErrors(error: ZodError): Record<string, string> {
	const errors: Record<string, string> = {};
	for (const issue of error.issues) {
		const path = issue.path.join('.');
		if (!errors[path]) {
			errors[path] = issue.message;
		}
	}
	return errors;
}

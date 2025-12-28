import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { formatZodErrors, parseFormData, parseJson } from './formValidation';

const TestSchema = z.object({
	name: z.string().min(1, 'Name is required')
});

describe('formatZodErrors', () => {
	it('formats single error', () => {
		const result = TestSchema.safeParse({ name: '' });
		if (!result.success) {
			const errors = formatZodErrors(result.error);
			expect(errors.name).toBe('Name is required');
		}
	});
});

describe('parseFormData', () => {
	it('returns success with valid data', () => {
		const formData = new FormData();
		formData.set('name', 'Test');

		const result = parseFormData(formData, TestSchema);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Test');
		}
	});
});

describe('parseJson', () => {
	it('returns success with valid JSON data', () => {
		const result = parseJson({ name: 'Test' }, TestSchema);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Test');
		}
	});
});

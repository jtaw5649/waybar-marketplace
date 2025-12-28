import { describe, it, expect } from 'vitest';
import { UpdateProfileSchema } from './user';

describe('UpdateProfileSchema', () => {
	it('accepts valid profile data', () => {
		const result = UpdateProfileSchema.safeParse({
			display_name: 'Test User',
			bio: 'A short bio',
			website_url: 'https://example.com'
		});
		expect(result.success).toBe(true);
	});

	it('accepts empty optional fields', () => {
		const result = UpdateProfileSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('transforms empty string URLs to null', () => {
		const result = UpdateProfileSchema.safeParse({
			website_url: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.website_url).toBeNull();
		}
	});

	it('rejects invalid URLs', () => {
		const result = UpdateProfileSchema.safeParse({
			website_url: 'not-a-url'
		});
		expect(result.success).toBe(false);
	});

	it('rejects display_name over 50 characters', () => {
		const result = UpdateProfileSchema.safeParse({
			display_name: 'a'.repeat(51)
		});
		expect(result.success).toBe(false);
	});

	it('rejects bio over 500 characters', () => {
		const result = UpdateProfileSchema.safeParse({
			bio: 'a'.repeat(501)
		});
		expect(result.success).toBe(false);
	});
});

import { describe, it, expect } from 'vitest';
import {
	CreateModuleSchema,
	AddToCollectionSchema,
	UploadScreenshotSchema,
	DeleteScreenshotSchema
} from './module';

describe('CreateModuleSchema', () => {
	it('accepts valid module data', () => {
		const result = CreateModuleSchema.safeParse({
			name: 'my-module',
			description: 'A test module',
			category: 'utility',
			version: '1.0.0',
			license: 'MIT'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid semver with prerelease', () => {
		const result = CreateModuleSchema.safeParse({
			name: 'test',
			description: 'Test',
			category: 'test',
			version: '1.0.0-beta.1',
			license: 'MIT'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid semver', () => {
		const result = CreateModuleSchema.safeParse({
			name: 'test',
			description: 'Test',
			category: 'test',
			version: 'v1.0',
			license: 'MIT'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name with invalid characters', () => {
		const result = CreateModuleSchema.safeParse({
			name: 'my module!',
			description: 'Test',
			category: 'test',
			version: '1.0.0',
			license: 'MIT'
		});
		expect(result.success).toBe(false);
	});

	it('rejects http URLs', () => {
		const result = CreateModuleSchema.safeParse({
			name: 'test',
			description: 'Test',
			category: 'test',
			version: '1.0.0',
			license: 'MIT',
			repo_url: 'http://github.com/test/repo'
		});
		expect(result.success).toBe(false);
	});

	it('accepts https URLs', () => {
		const result = CreateModuleSchema.safeParse({
			name: 'test',
			description: 'Test',
			category: 'test',
			version: '1.0.0',
			license: 'MIT',
			repo_url: 'https://github.com/test/repo'
		});
		expect(result.success).toBe(true);
	});
});

describe('AddToCollectionSchema', () => {
	it('accepts valid collection add', () => {
		const result = AddToCollectionSchema.safeParse({
			collection_id: 'abc-123'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty collection_id', () => {
		const result = AddToCollectionSchema.safeParse({
			collection_id: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('UploadScreenshotSchema', () => {
	it('accepts empty alt_text', () => {
		const result = UploadScreenshotSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('rejects alt_text over 200 characters', () => {
		const result = UploadScreenshotSchema.safeParse({
			alt_text: 'a'.repeat(201)
		});
		expect(result.success).toBe(false);
	});
});

describe('DeleteScreenshotSchema', () => {
	it('accepts valid screenshot_id', () => {
		const result = DeleteScreenshotSchema.safeParse({
			screenshot_id: 'abc-123'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty screenshot_id', () => {
		const result = DeleteScreenshotSchema.safeParse({
			screenshot_id: ''
		});
		expect(result.success).toBe(false);
	});
});

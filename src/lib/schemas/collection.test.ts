import { describe, it, expect } from 'vitest';
import {
	CreateCollectionSchema,
	UpdateCollectionSchema,
	DeleteCollectionSchema
} from './collection';

describe('CreateCollectionSchema', () => {
	it('accepts valid collection data', () => {
		const result = CreateCollectionSchema.safeParse({
			name: 'My Collection',
			description: 'A test collection',
			visibility: 'public'
		});
		expect(result.success).toBe(true);
	});

	it('trims whitespace from name', () => {
		const result = CreateCollectionSchema.safeParse({
			name: '  My Collection  '
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('My Collection');
		}
	});

	it('rejects whitespace-only name', () => {
		const result = CreateCollectionSchema.safeParse({
			name: '   '
		});
		expect(result.success).toBe(false);
	});

	it('defaults visibility to private', () => {
		const result = CreateCollectionSchema.safeParse({
			name: 'Test'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.visibility).toBe('private');
		}
	});

	it('rejects empty name', () => {
		const result = CreateCollectionSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 100 characters', () => {
		const result = CreateCollectionSchema.safeParse({
			name: 'a'.repeat(101)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid visibility', () => {
		const result = CreateCollectionSchema.safeParse({
			name: 'Test',
			visibility: 'hidden'
		});
		expect(result.success).toBe(false);
	});

	it('accepts unlisted visibility', () => {
		const result = CreateCollectionSchema.safeParse({
			name: 'Test',
			visibility: 'unlisted'
		});
		expect(result.success).toBe(true);
	});
});

describe('UpdateCollectionSchema', () => {
	it('accepts valid update data', () => {
		const result = UpdateCollectionSchema.safeParse({
			id: 'abc-123',
			name: 'Updated Name'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing id', () => {
		const result = UpdateCollectionSchema.safeParse({
			name: 'Updated Name'
		});
		expect(result.success).toBe(false);
	});
});

describe('DeleteCollectionSchema', () => {
	it('accepts valid id', () => {
		const result = DeleteCollectionSchema.safeParse({
			id: 'abc-123'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty id', () => {
		const result = DeleteCollectionSchema.safeParse({
			id: ''
		});
		expect(result.success).toBe(false);
	});
});

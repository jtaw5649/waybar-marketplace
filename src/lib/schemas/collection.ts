import { z } from 'zod';

const visibilityEnum = z.enum(['public', 'private', 'unlisted']);

export const CreateCollectionSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Collection name is required')
		.max(100, 'Name must be 100 characters or less'),
	description: z
		.string()
		.max(500, 'Description must be 500 characters or less')
		.nullable()
		.optional()
		.transform((v) => v?.trim() || null),
	visibility: visibilityEnum.default('private')
});

export const UpdateCollectionSchema = z.object({
	id: z.string().min(1, 'Collection ID is required'),
	name: z
		.string()
		.trim()
		.min(1, 'Collection name is required')
		.max(100, 'Name must be 100 characters or less')
		.optional(),
	description: z
		.string()
		.max(500, 'Description must be 500 characters or less')
		.nullable()
		.optional()
		.transform((v) => v?.trim() || null),
	visibility: visibilityEnum.optional()
});

export const DeleteCollectionSchema = z.object({
	id: z.string().min(1, 'Collection ID is required')
});

export type CreateCollectionInput = z.infer<typeof CreateCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionSchema>;
export type DeleteCollectionInput = z.infer<typeof DeleteCollectionSchema>;

import { z } from 'zod';

const SEMVER_REGEX = /^\d+\.\d+\.\d+(?:-[\w.]+)?(?:\+[\w.]+)?$/;

export const CreateModuleSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be 100 characters or less')
		.regex(/^[a-zA-Z0-9-]+$/, 'Name can only contain letters, numbers, and hyphens'),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(1000, 'Description must be 1000 characters or less'),
	category: z.string().min(1, 'Category is required'),
	version: z.string().regex(SEMVER_REGEX, 'Version must be valid semver (e.g., 1.0.0)'),
	license: z.string().min(1, 'License is required'),
	repo_url: z
		.string()
		.url('Must be a valid URL')
		.startsWith('https://', 'URL must use HTTPS')
		.optional()
		.or(z.literal('')),
	changelog: z.string().max(5000, 'Changelog must be 5000 characters or less').optional()
});

export const AddToCollectionSchema = z.object({
	collection_id: z.string().min(1, 'Collection ID is required'),
	note: z.string().max(500, 'Note must be 500 characters or less').nullable().optional()
});

export const UploadScreenshotSchema = z.object({
	alt_text: z.string().max(200, 'Alt text must be 200 characters or less').nullable().optional()
});

export const DeleteScreenshotSchema = z.object({
	screenshot_id: z.string().min(1, 'Screenshot ID is required')
});

export const CreateReviewSchema = z.object({
	rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
	title: z.string().max(100, 'Title must be 100 characters or less').nullable().optional(),
	body: z.string().max(2000, 'Review must be 2000 characters or less').nullable().optional()
});

export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type AddToCollectionInput = z.infer<typeof AddToCollectionSchema>;
export type UploadScreenshotInput = z.infer<typeof UploadScreenshotSchema>;
export type DeleteScreenshotInput = z.infer<typeof DeleteScreenshotSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

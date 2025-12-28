import { z } from 'zod';

const optionalUrl = z
	.string()
	.url('Must be a valid URL')
	.nullable()
	.optional()
	.or(z.literal(''))
	.transform((v) => (v === '' ? null : v));

export const UpdateProfileSchema = z.object({
	display_name: z
		.string()
		.max(50, 'Display name must be 50 characters or less')
		.nullable()
		.optional(),
	bio: z.string().max(500, 'Bio must be 500 characters or less').nullable().optional(),
	website_url: optionalUrl,
	github_url: optionalUrl,
	twitter_url: optionalUrl,
	bluesky_url: optionalUrl,
	discord_url: optionalUrl,
	sponsor_url: optionalUrl
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

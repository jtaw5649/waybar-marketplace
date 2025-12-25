export type SocialPlatform = 'github' | 'twitter' | 'bluesky' | 'discord';

const GITHUB_GITLAB_PROFILE_REGEX =
	/^https:\/\/(github\.com|gitlab\.com)\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/?$/;
const TWITTER_PROFILE_REGEX = /^https:\/\/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/;
const BLUESKY_PROFILE_REGEX = /^https:\/\/bsky\.app\/profile\/([a-zA-Z0-9.-]+)\/?$/;
const DISCORD_INVITE_REGEX =
	/^https:\/\/(discord\.gg\/[a-zA-Z0-9]+|discord\.com\/invite\/[a-zA-Z0-9]+)\/?$/;

export function validateSocialUrl(platform: SocialPlatform, url: string): boolean {
	if (!url) return true;

	switch (platform) {
		case 'github':
			return GITHUB_GITLAB_PROFILE_REGEX.test(url);
		case 'twitter':
			return TWITTER_PROFILE_REGEX.test(url);
		case 'bluesky':
			return BLUESKY_PROFILE_REGEX.test(url);
		case 'discord':
			return DISCORD_INVITE_REGEX.test(url);
		default:
			return false;
	}
}

export function extractSocialHandle(platform: SocialPlatform, url: string): string {
	if (!url) return '';

	switch (platform) {
		case 'github': {
			const match = url.match(GITHUB_GITLAB_PROFILE_REGEX);
			return match ? match[2] : '';
		}
		case 'twitter': {
			const match = url.match(TWITTER_PROFILE_REGEX);
			return match ? match[2] : '';
		}
		case 'bluesky': {
			const match = url.match(BLUESKY_PROFILE_REGEX);
			return match ? match[1] : '';
		}
		case 'discord':
			return '';
		default:
			return '';
	}
}

export function formatSocialUrl(platform: SocialPlatform, handle: string): string {
	if (!handle) return '';

	const cleanHandle = handle.replace(/^@/, '');

	switch (platform) {
		case 'github':
			return `https://github.com/${cleanHandle}`;
		case 'twitter':
			return `https://x.com/${cleanHandle}`;
		case 'bluesky':
			return `https://bsky.app/profile/${cleanHandle}`;
		default:
			return '';
	}
}

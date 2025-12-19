export type SocialPlatform = 'github' | 'twitter' | 'mastodon';

const GITHUB_PROFILE_REGEX =
	/^https:\/\/github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/?$/;
const TWITTER_PROFILE_REGEX = /^https:\/\/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/?$/;
const MASTODON_PROFILE_REGEX =
	/^https:\/\/([a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,})\/(@[a-zA-Z0-9_]+)\/?$/;

export function validateSocialUrl(platform: SocialPlatform, url: string): boolean {
	if (!url) return true;

	switch (platform) {
		case 'github':
			return GITHUB_PROFILE_REGEX.test(url);
		case 'twitter':
			return TWITTER_PROFILE_REGEX.test(url);
		case 'mastodon':
			return MASTODON_PROFILE_REGEX.test(url);
		default:
			return false;
	}
}

export function extractSocialHandle(platform: SocialPlatform, url: string): string {
	if (!url) return '';

	switch (platform) {
		case 'github': {
			const match = url.match(GITHUB_PROFILE_REGEX);
			return match ? match[1] : '';
		}
		case 'twitter': {
			const match = url.match(TWITTER_PROFILE_REGEX);
			return match ? match[2] : '';
		}
		case 'mastodon': {
			const match = url.match(MASTODON_PROFILE_REGEX);
			return match ? `${match[2]}@${match[1]}` : '';
		}
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
		default:
			return '';
	}
}

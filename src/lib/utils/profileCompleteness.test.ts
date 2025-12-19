import { describe, it, expect } from 'vitest';
import { calculateProfileCompleteness, type ProfileData } from './profileCompleteness';

describe('calculateProfileCompleteness', () => {
	describe('percentage calculation', () => {
		it('returns 0% for empty profile', () => {
			const profile: ProfileData = {
				display_name: null,
				bio: null,
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.percentage).toBe(0);
		});

		it('returns 100% for fully complete profile', () => {
			const profile: ProfileData = {
				display_name: 'John Doe',
				bio: 'A developer who loves Waybar',
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.percentage).toBe(100);
		});

		it('calculates partial completion correctly', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: null,
				website_url: null,
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.percentage).toBe(50);
		});

		it('treats empty strings as incomplete', () => {
			const profile: ProfileData = {
				display_name: '',
				bio: '',
				website_url: '',
				avatar_url: ''
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.percentage).toBe(0);
		});

		it('treats whitespace-only strings as incomplete', () => {
			const profile: ProfileData = {
				display_name: '   ',
				bio: '\t\n',
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.percentage).toBe(0);
		});
	});

	describe('missing fields', () => {
		it('lists all fields as missing for empty profile', () => {
			const profile: ProfileData = {
				display_name: null,
				bio: null,
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.missingFields).toContain('display_name');
			expect(result.missingFields).toContain('bio');
			expect(result.missingFields).toContain('website_url');
			expect(result.missingFields).toContain('avatar_url');
		});

		it('returns empty array for complete profile', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: 'Bio text',
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.missingFields).toHaveLength(0);
		});

		it('lists only missing fields for partial profile', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: null,
				website_url: 'https://example.com',
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.missingFields).toContain('bio');
			expect(result.missingFields).toContain('avatar_url');
			expect(result.missingFields).not.toContain('display_name');
			expect(result.missingFields).not.toContain('website_url');
		});
	});

	describe('suggestions', () => {
		it('provides suggestion for missing display name', () => {
			const profile: ProfileData = {
				display_name: null,
				bio: 'Bio',
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.suggestions).toHaveLength(1);
			expect(result.suggestions[0]).toContain('display name');
		});

		it('provides suggestion for missing bio', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: null,
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.suggestions).toHaveLength(1);
			expect(result.suggestions[0]).toContain('bio');
		});

		it('provides suggestion for missing website', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: 'Bio',
				website_url: null,
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.suggestions).toHaveLength(1);
			expect(result.suggestions[0]).toContain('website');
		});

		it('returns empty suggestions for complete profile', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: 'Bio',
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.suggestions).toHaveLength(0);
		});
	});

	describe('completion state', () => {
		it('returns incomplete state for 0%', () => {
			const profile: ProfileData = {
				display_name: null,
				bio: null,
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.state).toBe('incomplete');
		});

		it('returns partial state between 1-99%', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: null,
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.state).toBe('partial');
		});

		it('returns complete state for 100%', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: 'Bio',
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.state).toBe('complete');
		});
	});

	describe('filled count', () => {
		it('returns 0 filled for empty profile', () => {
			const profile: ProfileData = {
				display_name: null,
				bio: null,
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.filledCount).toBe(0);
			expect(result.totalCount).toBe(4);
		});

		it('returns correct count for partial profile', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: 'Bio',
				website_url: null,
				avatar_url: null
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.filledCount).toBe(2);
			expect(result.totalCount).toBe(4);
		});

		it('returns all filled for complete profile', () => {
			const profile: ProfileData = {
				display_name: 'John',
				bio: 'Bio',
				website_url: 'https://example.com',
				avatar_url: 'https://github.com/user.png'
			};
			const result = calculateProfileCompleteness(profile);
			expect(result.filledCount).toBe(4);
			expect(result.totalCount).toBe(4);
		});
	});
});

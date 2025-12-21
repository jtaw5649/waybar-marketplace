import { describe, it, expect } from 'vitest';
import { normalizeUsername } from './username';

describe('normalizeUsername', () => {
	it('normalizes undefined values to empty string', () => {
		expect(normalizeUsername(undefined)).toBe('');
	});

	it('normalizes null values to empty string', () => {
		expect(normalizeUsername(null)).toBe('');
	});

	it('lowercases and replaces invalid characters', () => {
		expect(normalizeUsername('User_Name.123')).toBe('user-name-123');
	});

	it('keeps valid hyphenated usernames', () => {
		expect(normalizeUsername('my-user')).toBe('my-user');
	});
});

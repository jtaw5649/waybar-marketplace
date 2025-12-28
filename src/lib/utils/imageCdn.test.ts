import { describe, expect, it } from 'vitest';
import { buildCloudflareImageUrl } from './imageCdn';

describe('buildCloudflareImageUrl', () => {
	it('builds a cdn-cgi image URL for same-origin assets', () => {
		const url = 'https://api.barforge.dev/screenshots/uuid/example.png';
		const result = buildCloudflareImageUrl(
			url,
			{ width: 640, quality: 80 },
			{ enabled: true, origin: 'https://api.barforge.dev' }
		);

		expect(result).toBe(
			'https://api.barforge.dev/cdn-cgi/image/width=640,fit=scale-down,quality=80,format=auto/screenshots/uuid/example.png'
		);
	});

	it('returns the original URL when disabled', () => {
		const url = 'https://api.barforge.dev/screenshots/uuid/example.png';
		const result = buildCloudflareImageUrl(
			url,
			{ width: 640, quality: 80 },
			{ enabled: false, origin: 'https://api.barforge.dev' }
		);

		expect(result).toBe(url);
	});

	it('returns the original URL for different origins', () => {
		const url = 'https://images.example.com/example.png';
		const result = buildCloudflareImageUrl(
			url,
			{ width: 640, quality: 80 },
			{ enabled: true, origin: 'https://api.barforge.dev' }
		);

		expect(result).toBe(url);
	});

	it('returns the original URL for invalid inputs', () => {
		const url = 'not-a-url';
		const result = buildCloudflareImageUrl(
			url,
			{ width: 640, quality: 80 },
			{ enabled: true, origin: 'https://api.barforge.dev' }
		);

		expect(result).toBe(url);
	});
});

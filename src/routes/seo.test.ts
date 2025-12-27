import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('SEO static files', () => {
	it('provides robots.txt with sitemap reference', () => {
		const filePath = path.resolve(process.cwd(), 'static/robots.txt');
		const content = readFileSync(filePath, 'utf8');

		expect(content).toContain('User-agent: *');
		expect(content).toContain('Sitemap:');
	});

	it('provides sitemap.xml with urlset', () => {
		const filePath = path.resolve(process.cwd(), 'static/sitemap.xml');
		const content = readFileSync(filePath, 'utf8');

		expect(content).toContain('<urlset');
		expect(content).toContain('<loc>');
	});
});

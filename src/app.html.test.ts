import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('app.html resource hints', () => {
	it('uses aggressive link preloading defaults', () => {
		const appHtml = readFileSync(path.resolve(process.cwd(), 'src/app.html'), 'utf8');

		expect(appHtml).toContain('data-sveltekit-preload-data="tap"');
		expect(appHtml).toContain('data-sveltekit-preload-code="viewport"');
	});

	it('adds DNS prefetch and preconnect for critical origins', () => {
		const appHtml = readFileSync(path.resolve(process.cwd(), 'src/app.html'), 'utf8');

		expect(appHtml).toContain('<link rel="dns-prefetch" href="https://api.barforge.dev"');
		expect(appHtml).toContain('<link rel="preconnect" href="https://api.barforge.dev"');
		expect(appHtml).toContain('<link rel="dns-prefetch" href="https://challenges.cloudflare.com"');
		expect(appHtml).toContain('<link rel="preconnect" href="https://challenges.cloudflare.com"');
	});
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const expectPreloadHoverLink = (file: string, href: string) => {
	const contents = readFileSync(path.resolve(process.cwd(), file), 'utf8');
	const pattern = new RegExp(
		`<a[^>]*href=\\"${href}\\"[^>]*data-sveltekit-preload-data=\\"hover\\"`,
		'g'
	);

	expect(pattern.test(contents)).toBe(true);
};

describe('targeted preload hints', () => {
	it('marks primary modules navigation links for hover preloading', () => {
		expectPreloadHoverLink('src/lib/components/Header.svelte', '/modules');
	});

	it('marks homepage navigation cards for hover preloading', () => {
		expectPreloadHoverLink('src/routes/+page.svelte', '/modules');
		expectPreloadHoverLink('src/routes/+page.svelte', '/upload');
	});
});

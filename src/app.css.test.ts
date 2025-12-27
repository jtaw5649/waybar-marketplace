import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('app.css theme tokens', () => {
	it('sets accessible faint text colors for dark and light themes', () => {
		const cssPath = path.resolve(process.cwd(), 'src/app.css');
		const css = readFileSync(cssPath, 'utf8');

		expect(css).toContain('--color-text-faint: #8f95aa;');
		expect(css).toContain('--color-text-faint: #5b6472;');
	});

	it('defines shared design tokens referenced in components', () => {
		const cssPath = path.resolve(process.cwd(), 'src/app.css');
		const css = readFileSync(cssPath, 'utf8');

		const tokens = [
			'--color-bg-hover:',
			'--color-bg-secondary:',
			'--color-border-hover:',
			'--color-danger:',
			'--color-primary-dark:',
			'--color-text:',
			'--font-size-lg:',
			'--font-size-md:',
			'--font-size-sm:',
			'--font-size-xl:',
			'--font-size-xs:',
			'--radius-full:',
			'--shadow-xl:',
			'--space-2xs:',
			'--space-4xl:'
		];

		for (const token of tokens) {
			expect(css).toContain(token);
		}
	});
});

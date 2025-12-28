import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('app layout', () => {
	it('includes the BackToTop control', () => {
		const layoutPath = path.resolve(process.cwd(), 'src/routes/+layout.svelte');
		const layoutSource = readFileSync(layoutPath, 'utf8');

		expect(layoutSource).toContain('<BackToTop');
		expect(layoutSource).toContain('BackToTop');
	});
});

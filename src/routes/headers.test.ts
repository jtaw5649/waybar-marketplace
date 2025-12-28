import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('static headers', () => {
	it('defines long-lived caching for immutable assets', () => {
		const headers = readFileSync(path.resolve(process.cwd(), '_headers'), 'utf8');

		expect(headers).toContain('/_app/immutable/*');
		expect(headers).toContain('Cache-Control: public, max-age=31536000, immutable');
		expect(headers).toContain('/fonts/*');
		expect(headers).toContain('/branding/*');
	});

	it('defines shorter caching for screenshots', () => {
		const headers = readFileSync(path.resolve(process.cwd(), '_headers'), 'utf8');

		expect(headers).toContain('/screenshots/*');
		expect(headers).toContain(
			'Cache-Control: public, max-age=86400, stale-while-revalidate=604800'
		);
	});
});

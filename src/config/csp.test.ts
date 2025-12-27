import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('svelte config CSP', () => {
	it('does not allow Google Fonts sources', () => {
		const configPath = path.resolve(process.cwd(), 'svelte.config.js');
		const configSource = readFileSync(configPath, 'utf8');

		expect(configSource).not.toContain('https://fonts.googleapis.com');
		expect(configSource).not.toContain('https://fonts.gstatic.com');
	});

	it('gates local registry API in connect-src to development only', () => {
		const configPath = path.resolve(process.cwd(), 'svelte.config.js');
		const configSource = readFileSync(configPath, 'utf8');

		expect(configSource).toContain("process.env.NODE_ENV === 'development'");
		expect(configSource).toContain('http://127.0.0.1:8787');
		expect(configSource).toContain('http://localhost:8787');
	});
});

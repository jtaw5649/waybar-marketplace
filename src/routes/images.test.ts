import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const collectSvelteFiles = (dir: string): string[] => {
	const entries = readdirSync(dir);
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry);
		const stats = statSync(fullPath);
		if (stats.isDirectory()) {
			files.push(...collectSvelteFiles(fullPath));
			continue;
		}
		if (entry.endsWith('.svelte')) {
			files.push(fullPath);
		}
	}

	return files;
};

describe('image loading attributes', () => {
	it('ensures <img> tags include a loading attribute', () => {
		const root = path.resolve(process.cwd(), 'src');
		const files = collectSvelteFiles(root);
		const missing: { file: string; tag: string }[] = [];
		const imgTagRegex = /<img\b[^>]*>/g;

		for (const file of files) {
			const content = readFileSync(file, 'utf8');
			const matches = content.match(imgTagRegex) ?? [];
			for (const tag of matches) {
				if (!/loading\s*=/.test(tag)) {
					missing.push({ file: path.relative(root, file), tag });
				}
			}
		}

		expect(missing).toEqual([]);
	});
});

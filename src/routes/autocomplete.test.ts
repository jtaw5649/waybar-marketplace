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

const ignoredTypes = new Set(['checkbox', 'radio', 'file', 'hidden', 'submit', 'button']);

describe('input autocomplete attributes', () => {
	it('requires autocomplete for text-like input fields', () => {
		const root = path.resolve(process.cwd(), 'src');
		const files = collectSvelteFiles(root);
		const missing: { file: string; tag: string }[] = [];
		const inputTagRegex = /<input\b[^>]*>/g;

		for (const file of files) {
			const content = readFileSync(file, 'utf8');
			const matches = content.match(inputTagRegex) ?? [];
			for (const tag of matches) {
				if (/\bautocomplete\b/.test(tag)) continue;
				const typeMatch = tag.match(/type\s*=\s*["']([^"']+)["']/);
				const type = typeMatch ? typeMatch[1].toLowerCase() : 'text';
				if (ignoredTypes.has(type)) continue;
				missing.push({ file: path.relative(root, file), tag });
			}
		}

		expect(missing).toEqual([]);
	});
});

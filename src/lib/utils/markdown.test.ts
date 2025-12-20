import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
	describe('basic markdown', () => {
		it('renders paragraphs', () => {
			const result = renderMarkdown('Hello world');
			expect(result).toContain('<p>');
			expect(result).toContain('Hello world');
		});

		it('renders headings', () => {
			const result = renderMarkdown('# Heading 1\n## Heading 2');
			expect(result).toContain('<h1>Heading 1</h1>');
			expect(result).toContain('<h2>Heading 2</h2>');
		});

		it('renders bold text', () => {
			const result = renderMarkdown('**bold text**');
			expect(result).toContain('<strong>bold text</strong>');
		});

		it('renders italic text', () => {
			const result = renderMarkdown('*italic text*');
			expect(result).toContain('<em>italic text</em>');
		});

		it('renders inline code', () => {
			const result = renderMarkdown('use `npm install`');
			expect(result).toContain('<code>npm install</code>');
		});
	});

	describe('GitHub Flavored Markdown', () => {
		it('renders code blocks with language', () => {
			const result = renderMarkdown('```javascript\nconst x = 1;\n```');
			expect(result).toContain('<pre>');
			expect(result).toContain('<code');
			expect(result).toContain('const x = 1;');
		});

		it('renders unordered lists', () => {
			const result = renderMarkdown('- item 1\n- item 2');
			expect(result).toContain('<ul>');
			expect(result).toContain('<li>item 1</li>');
			expect(result).toContain('<li>item 2</li>');
		});

		it('renders ordered lists', () => {
			const result = renderMarkdown('1. first\n2. second');
			expect(result).toContain('<ol>');
			expect(result).toContain('<li>first</li>');
			expect(result).toContain('<li>second</li>');
		});

		it('renders task lists (checkboxes sanitized)', () => {
			const result = renderMarkdown('- [ ] unchecked\n- [x] checked');
			expect(result).toContain('<ul>');
			expect(result).toContain('<li>');
			expect(result).toContain('unchecked');
			expect(result).toContain('checked');
		});

		it('renders tables', () => {
			const table = '| Col1 | Col2 |\n|------|------|\n| A    | B    |';
			const result = renderMarkdown(table);
			expect(result).toContain('<table>');
			expect(result).toContain('<th>Col1</th>');
			expect(result).toContain('<td>A</td>');
		});

		it('renders strikethrough', () => {
			const result = renderMarkdown('~~deleted~~');
			expect(result).toContain('<del>deleted</del>');
		});
	});

	describe('line breaks', () => {
		it('converts single newlines to <br>', () => {
			const result = renderMarkdown('line 1\nline 2');
			expect(result).toContain('<br');
		});
	});

	describe('links', () => {
		it('renders links', () => {
			const result = renderMarkdown('[GitHub](https://github.com)');
			expect(result).toContain('<a href="https://github.com"');
			expect(result).toContain('>GitHub</a>');
		});

		it('renders autolinks', () => {
			const result = renderMarkdown('https://example.com');
			expect(result).toContain('href="https://example.com"');
		});
	});

	describe('sanitization', () => {
		it('removes script tags', () => {
			const result = renderMarkdown('<script>alert("xss")</script>');
			expect(result).not.toContain('<script>');
			expect(result).not.toContain('alert');
		});

		it('removes onclick handlers', () => {
			const result = renderMarkdown('<div onclick="alert(1)">click</div>');
			expect(result).not.toContain('onclick');
		});

		it('removes javascript: URLs', () => {
			const result = renderMarkdown('[click](javascript:alert(1))');
			expect(result).not.toContain('javascript:');
		});

		it('allows safe HTML elements', () => {
			const result = renderMarkdown('plain text');
			expect(result).toContain('<p>');
		});
	});

	describe('edge cases', () => {
		it('handles empty string', () => {
			const result = renderMarkdown('');
			expect(result).toBe('');
		});

		it('handles whitespace only', () => {
			const result = renderMarkdown('   \n\n   ');
			expect(result.trim()).toBe('');
		});

		it('handles special characters', () => {
			const result = renderMarkdown('< > & " \'');
			expect(result).toContain('&lt;');
			expect(result).toContain('&gt;');
			expect(result).toContain('&amp;');
		});
	});
});

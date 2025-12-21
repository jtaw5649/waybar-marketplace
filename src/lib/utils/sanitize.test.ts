import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
	describe('script removal', () => {
		it('removes inline script tags', () => {
			const dirty = '<p>Hello</p><script>alert("XSS")</script>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('<script');
			expect(clean).toContain('<p>Hello</p>');
		});

		it('removes script tags with src attribute', () => {
			const dirty = '<script src="evil.js"></script><p>Safe</p>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('<script');
			expect(clean).toContain('<p>Safe</p>');
		});
	});

	describe('event handler removal', () => {
		it('removes onerror handlers from images', () => {
			const dirty = '<img src="x" onerror="alert(1)">';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('onerror');
		});

		it('removes onclick handlers', () => {
			const dirty = '<a href="#" onclick="evil()">Link</a>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('onclick');
		});

		it('removes onload handlers', () => {
			const dirty = '<img src="x" onload="steal()">';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('onload');
		});

		it('removes onmouseover handlers', () => {
			const dirty = '<div onmouseover="track()">Hover</div>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('onmouseover');
		});
	});

	describe('dangerous protocol removal', () => {
		it('removes javascript: protocol links', () => {
			const dirty = '<a href="javascript:alert(1)">Click</a>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('javascript:');
		});

		it('removes data: protocol in links', () => {
			const dirty = '<a href="data:text/html,<script>alert(1)</script>">X</a>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('data:text/html');
		});
	});

	describe('safe content preservation', () => {
		it('preserves headings', () => {
			const input = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<h1>Title</h1>');
			expect(clean).toContain('<h2>Subtitle</h2>');
			expect(clean).toContain('<h3>Section</h3>');
		});

		it('preserves code blocks', () => {
			const input = '<pre><code>const x = 1;</code></pre>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<pre>');
			expect(clean).toContain('<code>');
			expect(clean).toContain('const x = 1;');
		});

		it('preserves inline code', () => {
			const input = '<p>Use <code>npm install</code></p>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<code>npm install</code>');
		});

		it('preserves unordered lists', () => {
			const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<ul>');
			expect(clean).toContain('<li>Item 1</li>');
		});

		it('preserves ordered lists', () => {
			const input = '<ol><li>First</li><li>Second</li></ol>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<ol>');
			expect(clean).toContain('<li>First</li>');
		});

		it('preserves safe links with https', () => {
			const input = '<a href="https://example.com">Link</a>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('href="https://example.com"');
		});

		it('adds rel noopener noreferrer to target blank links', () => {
			const input = '<a href="https://example.com" target="_blank">Link</a>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('target="_blank"');
			expect(clean).toContain('rel="noopener noreferrer"');
		});

		it('preserves images with valid src', () => {
			const input = '<img src="https://example.com/img.png" alt="Image">';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('src="https://example.com/img.png"');
			expect(clean).toContain('alt="Image"');
		});

		it('preserves blockquotes', () => {
			const input = '<blockquote>Quote text</blockquote>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<blockquote>Quote text</blockquote>');
		});

		it('preserves emphasis and strong', () => {
			const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<strong>Bold</strong>');
			expect(clean).toContain('<em>italic</em>');
		});

		it('preserves tables', () => {
			const input = '<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>';
			const clean = sanitizeHtml(input);
			expect(clean).toContain('<table>');
			expect(clean).toContain('<th>Header</th>');
			expect(clean).toContain('<td>Cell</td>');
		});
	});

	describe('edge cases', () => {
		it('handles empty string', () => {
			expect(sanitizeHtml('')).toBe('');
		});

		it('handles plain text', () => {
			expect(sanitizeHtml('Hello world')).toBe('Hello world');
		});

		it('handles nested dangerous content', () => {
			const dirty = '<div><p><span onclick="x()">Text</span></p></div>';
			const clean = sanitizeHtml(dirty);
			expect(clean).not.toContain('onclick');
			expect(clean).toContain('Text');
		});

		it('handles mixed safe and dangerous content', () => {
			const dirty = '<h1>Title</h1><script>bad()</script><p>Safe paragraph</p>';
			const clean = sanitizeHtml(dirty);
			expect(clean).toContain('<h1>Title</h1>');
			expect(clean).toContain('<p>Safe paragraph</p>');
			expect(clean).not.toContain('<script');
		});
	});
});

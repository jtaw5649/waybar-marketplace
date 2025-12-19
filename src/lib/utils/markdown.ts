import { marked } from 'marked';
import { sanitizeHtml } from './sanitize';

marked.setOptions({
	gfm: true,
	breaks: true
});

export function renderMarkdown(content: string): string {
	return sanitizeHtml(marked.parse(content) as string);
}

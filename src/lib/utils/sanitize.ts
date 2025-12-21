import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'p',
	'br',
	'hr',
	'strong',
	'em',
	'b',
	'i',
	'u',
	's',
	'del',
	'a',
	'img',
	'ul',
	'ol',
	'li',
	'pre',
	'code',
	'blockquote',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'div',
	'span'
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'];

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
		const rel = node.getAttribute('rel') || '';
		const relTokens = new Set(rel.split(/\s+/).filter(Boolean));
		relTokens.add('noopener');
		relTokens.add('noreferrer');
		node.setAttribute('rel', Array.from(relTokens).join(' '));
	}
});

export function sanitizeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS,
		ALLOWED_ATTR,
		ALLOW_DATA_ATTR: false
	});
}

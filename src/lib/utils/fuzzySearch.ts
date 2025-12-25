import uFuzzy from '@leeoniya/ufuzzy';

export interface SearchableItem {
	id: string;
	name?: string;
	description?: string;
	[key: string]: unknown;
}

export interface SearchResult<T extends SearchableItem = SearchableItem> {
	item: T;
	score: number;
	highlights: Record<string, string>;
}

const fuzzer = new uFuzzy({
	intraMode: 1,
	intraIns: 1,
	intraSub: 1,
	intraTrn: 1,
	intraDel: 1
});

function highlightMatches(text: string, ranges: number[]): string {
	if (!ranges || ranges.length === 0) return text;

	let result = '';
	let lastEnd = 0;

	for (let i = 0; i < ranges.length; i += 2) {
		const start = ranges[i];
		const end = ranges[i + 1];
		result += text.slice(lastEnd, start);
		result += `<mark>${text.slice(start, end)}</mark>`;
		lastEnd = end;
	}

	result += text.slice(lastEnd);
	return result;
}

function getFieldValue(item: SearchableItem, field: string): string {
	const value = item[field];
	return typeof value === 'string' ? value : '';
}

export function fuzzySearch<T extends SearchableItem>(
	items: T[],
	query: string,
	fields: string[] = ['name', 'description']
): SearchResult<T>[] {
	const trimmedQuery = query.trim();
	if (!trimmedQuery || items.length === 0) return [];

	const resultMap = new Map<string, { score: number; highlights: Record<string, string> }>();

	for (const field of fields) {
		const haystack = items.map((item) => getFieldValue(item, field));
		const idxs = fuzzer.filter(haystack, trimmedQuery);

		if (!idxs || idxs.length === 0) continue;

		const info = fuzzer.info(idxs, haystack, trimmedQuery);
		const order = fuzzer.sort(info, haystack, trimmedQuery);

		for (let i = 0; i < order.length; i++) {
			const idx = info.idx[order[i]];
			const item = items[idx];
			const score = order.length - i + (field === 'name' ? 1000 : 0);
			const text = haystack[idx];
			const ranges = info.ranges[order[i]];
			const highlighted = highlightMatches(text, ranges);

			const existing = resultMap.get(item.id);
			if (existing) {
				existing.highlights[field] = highlighted;
				existing.score = Math.max(existing.score, score);
			} else {
				resultMap.set(item.id, {
					score,
					highlights: { [field]: highlighted }
				});
			}
		}
	}

	const results: SearchResult<T>[] = [];
	for (const item of items) {
		const match = resultMap.get(item.id);
		if (match) {
			results.push({
				item,
				score: match.score,
				highlights: match.highlights
			});
		}
	}

	return results.sort((a, b) => b.score - a.score);
}

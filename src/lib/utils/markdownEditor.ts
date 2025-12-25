export interface TextSelection {
	start: number;
	end: number;
}

export function wrapSelection(
	text: string,
	selection: TextSelection,
	prefix: string,
	suffix: string,
	placeholder?: string
) {
	const before = text.slice(0, selection.start);
	const selected = text.slice(selection.start, selection.end);
	const after = text.slice(selection.end);
	const content = selected || placeholder || '';

	return {
		text: before + prefix + content + suffix + after,
		newSelection: {
			start: selection.start + prefix.length,
			end: selection.start + prefix.length + content.length
		}
	};
}

export function insertAtCursor(text: string, cursor: number, insert: string) {
	return {
		text: text.slice(0, cursor) + insert + text.slice(cursor),
		newCursor: cursor + insert.length
	};
}

export type MarkdownFormat = 'bold' | 'italic' | 'code' | 'link';

export function insertMarkdown(text: string, selection: TextSelection, format: MarkdownFormat) {
	switch (format) {
		case 'bold':
			return wrapSelection(text, selection, '**', '**');
		case 'italic':
			return wrapSelection(text, selection, '*', '*');
		case 'code':
			return wrapSelection(text, selection, '`', '`');
		case 'link':
			return wrapSelection(text, selection, '[', '](url)');
	}
}

export function createUndoStack() {
	const history: string[] = [];
	let index = -1;
	let maxIndex = -1;

	return {
		canUndo: () => index > 0,
		push: (state: string) => {
			index++;
			maxIndex = index;
			history[index] = state;
		},
		undo: () => {
			if (index > 0) {
				index--;
				return history[index];
			}
		},
		redo: () => {
			if (index < maxIndex) {
				index++;
				return history[index];
			}
		}
	};
}

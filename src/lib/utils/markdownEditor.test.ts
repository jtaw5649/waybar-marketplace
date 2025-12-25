import { describe, it, expect } from 'vitest';
import {
	wrapSelection,
	insertAtCursor,
	createUndoStack,
	insertMarkdown,
	type TextSelection
} from './markdownEditor';

describe('wrapSelection', () => {
	it('wraps selected text with markers', () => {
		const text = 'hello world';
		const selection: TextSelection = { start: 6, end: 11 };
		const result = wrapSelection(text, selection, '**', '**');
		expect(result.text).toBe('hello **world**');
		expect(result.newSelection.start).toBe(8);
		expect(result.newSelection.end).toBe(13);
	});

	it('inserts placeholder when no selection', () => {
		const text = 'hello world';
		const selection: TextSelection = { start: 6, end: 6 };
		const result = wrapSelection(text, selection, '**', '**', 'bold text');
		expect(result.text).toBe('hello **bold text**world');
		expect(result.newSelection.start).toBe(8);
		expect(result.newSelection.end).toBe(17);
	});
});

describe('insertAtCursor', () => {
	it('inserts text at cursor position', () => {
		const result = insertAtCursor('hello world', 6, '## ');
		expect(result.text).toBe('hello ## world');
		expect(result.newCursor).toBe(9);
	});
});

describe('createUndoStack', () => {
	it('starts with canUndo false', () => {
		const stack = createUndoStack();
		expect(stack.canUndo()).toBe(false);
	});

	it('canUndo is true after two pushes', () => {
		const stack = createUndoStack();
		stack.push('first');
		stack.push('second');
		expect(stack.canUndo()).toBe(true);
	});

	it('undo returns previous state', () => {
		const stack = createUndoStack();
		stack.push('first');
		stack.push('second');
		expect(stack.undo()).toBe('first');
	});

	it('redo returns undone state', () => {
		const stack = createUndoStack();
		stack.push('first');
		stack.push('second');
		stack.undo();
		expect(stack.redo()).toBe('second');
	});
});

describe('insertMarkdown', () => {
	it('applies bold formatting', () => {
		const result = insertMarkdown('hello world', { start: 6, end: 11 }, 'bold');
		expect(result.text).toBe('hello **world**');
	});

	it('applies italic formatting', () => {
		const result = insertMarkdown('hello world', { start: 6, end: 11 }, 'italic');
		expect(result.text).toBe('hello *world*');
	});

	it('applies code formatting', () => {
		const result = insertMarkdown('hello code here', { start: 6, end: 10 }, 'code');
		expect(result.text).toBe('hello `code` here');
	});

	it('applies link formatting', () => {
		const result = insertMarkdown('click here', { start: 0, end: 5 }, 'link');
		expect(result.text).toBe('[click](url) here');
	});
});

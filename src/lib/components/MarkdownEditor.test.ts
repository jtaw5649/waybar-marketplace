// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import MarkdownEditor from './MarkdownEditor.svelte';

describe('MarkdownEditor', () => {
	it('renders Write and Preview tabs', () => {
		render(MarkdownEditor, { value: '' });

		const writeTab = screen.getByRole('button', { name: 'Write' });
		const previewTab = screen.getByRole('button', { name: 'Preview' });

		expect(writeTab).toBeTruthy();
		expect(previewTab).toBeTruthy();
	});

	it('shows file upload hint in footer when onFileUpload is provided', () => {
		const mockUpload = async () => 'https://example.com/file.png';
		render(MarkdownEditor, { value: '', onFileUpload: mockUpload });

		const hint = screen.getByText(/paste, drop, or click to add files/i);
		expect(hint).toBeTruthy();
	});

	it('shows drag indicator when file is dragged over', async () => {
		const mockUpload = async () => 'https://example.com/file.png';
		const { container } = render(MarkdownEditor, { value: '', onFileUpload: mockUpload });

		const editor = container.querySelector('.markdown-editor');
		expect(editor).toBeTruthy();

		const dragEvent = new Event('dragenter', { bubbles: true });
		editor?.dispatchEvent(dragEvent);
		await tick();

		const indicator = container.querySelector('.drag-active');
		expect(indicator).toBeTruthy();
	});

	it('has accessible role attribute for drag handlers', () => {
		const mockUpload = async () => 'https://example.com/file.png';
		const { container } = render(MarkdownEditor, { value: '', onFileUpload: mockUpload });

		const editor = container.querySelector('.markdown-editor');
		expect(editor?.getAttribute('role')).toBe('region');
	});

	it('calls onFileUpload when file is dropped', async () => {
		const mockUpload = vi.fn().mockResolvedValue('https://example.com/uploaded.png');
		const { container } = render(MarkdownEditor, { value: '', onFileUpload: mockUpload });

		const editor = container.querySelector('.markdown-editor');
		const file = new File(['test'], 'test.png', { type: 'image/png' });

		const dropEvent = new Event('drop', { bubbles: true }) as Event & {
			dataTransfer: { files: FileList };
		};
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: { files: [file] }
		});

		editor?.dispatchEvent(dropEvent);
		await tick();

		expect(mockUpload).toHaveBeenCalledWith(file);
	});
});

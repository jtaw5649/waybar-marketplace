<script lang="ts">
	import { renderMarkdown } from '$lib/utils/markdown';
	import { insertMarkdown, type MarkdownFormat } from '$lib/utils/markdownEditor';

	interface Props {
		value?: string;
		placeholder?: string;
		maxlength?: number;
		rows?: number;
		disabled?: boolean;
		id?: string;
		name?: string;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onFileUpload?: (file: File) => Promise<string>;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		maxlength,
		rows = 6,
		disabled = false,
		id,
		name,
		oninput,
		onchange,
		onFileUpload
	}: Props = $props();

	let activeTab: 'write' | 'preview' = $state('write');
	let previewHtml = $derived(renderMarkdown(value));
	let textareaEl: HTMLTextAreaElement | undefined = $state();
	let isDragging = $state(false);

	function handleDragEnter(e: Event) {
		if (!onFileUpload) return;
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: Event) {
		if (!onFileUpload) return;
		e.preventDefault();
		isDragging = false;
	}

	function handleDragOver(e: Event) {
		if (!onFileUpload) return;
		e.preventDefault();
	}

	async function handleDrop(e: DragEvent) {
		if (!onFileUpload) return;
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			await onFileUpload(files[0]);
		}
	}

	function applyFormat(format: MarkdownFormat) {
		if (!textareaEl) return;
		const start = textareaEl.selectionStart;
		const end = textareaEl.selectionEnd;
		const result = insertMarkdown(value, { start, end }, format);
		value = result.text;
		requestAnimationFrame(() => {
			textareaEl?.setSelectionRange(result.newSelection.start, result.newSelection.end);
			textareaEl?.focus();
		});
	}
</script>

<div
	class="markdown-editor"
	class:disabled
	class:drag-active={isDragging}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	role="region"
>
	<div class="tabs">
		<button
			type="button"
			class="tab"
			class:active={activeTab === 'write'}
			onclick={() => (activeTab = 'write')}
			{disabled}
		>
			Write
		</button>
		<button
			type="button"
			class="tab"
			class:active={activeTab === 'preview'}
			onclick={() => (activeTab = 'preview')}
			{disabled}
		>
			Preview
		</button>
	</div>

	{#if activeTab === 'write'}
		<div class="toolbar">
			<button
				type="button"
				class="toolbar-btn"
				title="Bold (Ctrl+B)"
				onclick={() => applyFormat('bold')}
				{disabled}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path
						d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
					/>
				</svg>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				title="Italic (Ctrl+I)"
				onclick={() => applyFormat('italic')}
				{disabled}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line
						x1="15"
						y1="4"
						x2="9"
						y2="20"
					/>
				</svg>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				title="Code"
				onclick={() => applyFormat('code')}
				{disabled}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
				</svg>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				title="Link (Ctrl+K)"
				onclick={() => applyFormat('link')}
				{disabled}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path
						d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<div class="content">
		{#if activeTab === 'write'}
			<textarea
				bind:this={textareaEl}
				{id}
				{name}
				{placeholder}
				{maxlength}
				{rows}
				{disabled}
				bind:value
				{oninput}
				{onchange}
			></textarea>
		{:else}
			<div class="preview markdown-preview">
				{#if value.trim()}
					{@html previewHtml}
				{:else}
					<p class="preview-empty">Nothing to preview</p>
				{/if}
			</div>
		{/if}
	</div>

	<div class="footer">
		<span class="markdown-hint">Markdown is supported</span>
		{#if onFileUpload}
			<span class="file-hint">Paste, drop, or click to add files</span>
		{/if}
	</div>
</div>

<style>
	.markdown-editor {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		overflow: hidden;
	}

	.markdown-editor.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.tabs {
		display: flex;
		gap: var(--space-xs);
		padding: var(--space-sm);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
	}

	.tab {
		padding: var(--space-xs) var(--space-sm);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.tab:hover {
		color: var(--color-text-normal);
		background-color: var(--color-bg-hover);
	}

	.tab.active {
		color: var(--color-text-normal);
		background-color: var(--color-bg-base);
	}

	.toolbar {
		display: flex;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border-bottom: 1px solid var(--color-border);
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.toolbar-btn:hover {
		color: var(--color-text-normal);
		background-color: var(--color-bg-hover);
	}

	.toolbar-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.content {
		min-height: 150px;
	}

	textarea {
		width: 100%;
		min-height: 150px;
		padding: var(--space-md);
		border: none;
		background: transparent;
		color: var(--color-text-normal);
		font-family: inherit;
		font-size: 0.875rem;
		line-height: 1.5;
		resize: vertical;
	}

	textarea::placeholder {
		color: var(--color-text-faint);
	}

	textarea:focus {
		outline: none;
	}

	.preview {
		padding: var(--space-md);
		min-height: 150px;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.preview-empty {
		color: var(--color-text-faint);
		font-style: italic;
	}

	.footer {
		display: flex;
		align-items: center;
		padding: var(--space-xs) var(--space-sm);
		border-top: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
	}

	.markdown-hint {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}
</style>

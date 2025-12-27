<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { renderMarkdown } from '$lib/utils/markdown';
	import {
		ALLOWED_PACKAGE_EXTENSIONS,
		isAllowedPackageExtension,
		isPackageSizeAllowed
	} from '$lib/utils/packageValidation';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import MarkdownEditor from '$lib/components/MarkdownEditor.svelte';
	import { Turnstile } from 'svelte-turnstile';
	import { toast } from '$lib/stores/toast.svelte';
	import { getCategorySlugs, getCategoryName } from '$lib/constants/categories';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const categories = getCategorySlugs();

	let name = $state('');
	let description = $state('');
	let category = $state('custom');
	let repoUrl = $state('');
	let version = $state('1.0.0');
	let license = $state('');
	let packageFile: File | null = $state(null);
	let changelog = $state('');

	let loading = $state(false);
	let fileError: string | null = $state(null);
	let showPreview = $state(false);

	const success = $derived(form?.success === true);

	$effect(() => {
		if (form?.success) {
			toast.success('Module published successfully!');
		} else if (form?.message) {
			toast.error(form.message);
		}
	});

	const hasUnsavedChanges = $derived(
		!success && (name.trim() !== '' || description.trim() !== '' || packageFile !== null)
	);

	$effect(() => {
		function handleBeforeUnload(e: BeforeUnloadEvent) {
			if (hasUnsavedChanges) {
				e.preventDefault();
			}
		}
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0] || null;
		fileError = null;

		if (!file) {
			packageFile = null;
			return;
		}

		const hasValidExtension = isAllowedPackageExtension(file.name);

		if (!hasValidExtension) {
			fileError = `File must be one of: ${ALLOWED_PACKAGE_EXTENSIONS.join(', ')}`;
			packageFile = null;
			target.value = '';
			return;
		}

		if (!isPackageSizeAllowed(file.size)) {
			fileError = `File size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
			packageFile = null;
			target.value = '';
			return;
		}

		packageFile = file;
	}
</script>

<Header session={data.session} />

<main id="main-content">
	<div class="page-header">
		<div class="page-header-content">
			<div class="page-header-text">
				<h1>Upload Module</h1>
				<p>Share your module with the community</p>
			</div>
		</div>
	</div>

	<section class="content">
		{#if !data.session?.user}
			<div class="auth-required">
				<div class="auth-icon">
					<svg
						viewBox="0 0 24 24"
						width="48"
						height="48"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<circle cx="12" cy="8" r="4" />
						<path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
					</svg>
				</div>
				<h2>Log In Required</h2>
				<p>You need to log in to upload modules.</p>
				<a href="/login" class="btn btn-primary">Log In with GitHub</a>
			</div>
		{:else if success}
			<div class="success-message">
				<div class="success-icon">
					<svg
						viewBox="0 0 24 24"
						width="48"
						height="48"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<circle cx="12" cy="12" r="10" />
						<polyline points="9,12 12,15 16,10" />
					</svg>
				</div>
				<h2>Module Published!</h2>
				<p>Your module has been successfully published to the registry.</p>
				<div class="success-actions">
					<a href="/modules" class="btn btn-primary">Browse Modules</a>
					<a href="/dashboard" class="btn btn-secondary">Go to Dashboard</a>
				</div>
			</div>
		{:else}
			<form
				method="POST"
				action="?/upload"
				enctype="multipart/form-data"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<div class="form-group">
					<label for="name">Module Name</label>
					<input
						type="text"
						id="name"
						name="name"
						autocomplete="off"
						bind:value={name}
						placeholder="My Awesome Module"
						required
						maxlength="100"
					/>
				</div>

				<div class="form-group">
					<div class="label-row">
						<label for="description">Description (Markdown supported)</label>
						<button
							type="button"
							class="preview-toggle"
							onclick={() => (showPreview = !showPreview)}
						>
							{showPreview ? 'Edit' : 'Preview'}
						</button>
					</div>
					{#if showPreview}
						<div class="markdown-preview">
							{#if description}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								{@html renderMarkdown(description)}
							{:else}
								<span class="placeholder">Preview will appear here...</span>
							{/if}
						</div>
						<input type="hidden" name="description" value={description} />
					{:else}
						<textarea
							id="description"
							name="description"
							bind:value={description}
							placeholder="A brief description of what your module does...

Supports **Markdown** formatting:
- Lists
- `code`
- [links](url)
- etc."
							required
							maxlength="5000"
							rows="8"
						></textarea>
					{/if}
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="category">Category</label>
						<select id="category" name="category" bind:value={category}>
							{#each categories as cat (cat)}
								<option value={cat}>{getCategoryName(cat)}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="version">Version</label>
						<input
							type="text"
							id="version"
							name="version"
							autocomplete="off"
							bind:value={version}
							placeholder="1.0.0"
							required
							pattern="[0-9]+\.[0-9]+\.[0-9]+.*"
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="repoUrl">Repository URL</label>
					<input
						type="url"
						id="repoUrl"
						name="repo_url"
						autocomplete="url"
						bind:value={repoUrl}
						placeholder="https://github.com/user/repo"
						required
					/>
				</div>

				<div class="form-group">
					<label for="license">License (SPDX)</label>
					<input
						type="text"
						id="license"
						name="license"
						autocomplete="off"
						bind:value={license}
						placeholder="MIT"
						pattern="[A-Za-z0-9.+-]+"
						title="Use an SPDX license identifier like MIT or GPL-3.0-or-later"
						required
					/>
				</div>

				<div class="form-group">
					<label for="package">Package File (.tar.gz)</label>
					<div class="file-input-wrapper">
						<input
							type="file"
							id="package"
							name="package"
							accept=".tar.gz,.tgz"
							onchange={handleFileChange}
							required
						/>
						<div class="file-input-display">
							<svg
								viewBox="0 0 24 24"
								width="24"
								height="24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="17 8 12 3 7 8" />
								<line x1="12" y1="3" x2="12" y2="15" />
							</svg>
							<span>{packageFile ? packageFile.name : 'Choose a file or drag it here'}</span>
						</div>
					</div>
					{#if fileError}
						<p class="field-error">{fileError}</p>
					{:else}
						<small>Max 10MB. Must be a valid tar.gz archive.</small>
					{/if}
				</div>

				<div class="form-group">
					<label for="changelog">Changelog (optional)</label>
					<MarkdownEditor
						id="changelog"
						name="changelog"
						bind:value={changelog}
						placeholder="What's new in this version..."
						rows={3}
					/>
				</div>

				{#if data.turnstileSiteKey}
					<Turnstile siteKey={data.turnstileSiteKey} />
				{/if}

				<button type="submit" class="btn btn-primary btn-submit" disabled={loading}>
					{#if loading}
						<span class="spinner"></span>
						Publishing...
					{:else}
						Publish Module
					{/if}
				</button>
			</form>
		{/if}
	</section>
</main>

<Footer />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-top: 5rem;
	}

	.page-header {
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
	}

	.page-header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-xl) var(--space-2xl);
	}

	.page-header-text h1 {
		font-size: 1.75rem;
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.page-header-text p {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.content {
		padding: var(--space-2xl);
		max-width: 640px;
		margin: 0 auto;
		width: 100%;
	}

	.auth-required,
	.success-message {
		text-align: center;
		padding: var(--space-3xl);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.auth-icon,
	.success-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background-color: var(--color-bg-elevated);
		border-radius: 50%;
		margin-bottom: var(--space-lg);
	}

	.auth-icon svg {
		color: var(--color-text-muted);
	}

	.success-icon {
		background-color: rgba(16, 185, 129, 0.1);
	}

	.success-icon svg {
		color: #10b981;
	}

	.auth-required h2,
	.success-message h2 {
		margin-bottom: var(--space-md);
	}

	.success-message h2 {
		color: #10b981;
	}

	.auth-required p,
	.success-message p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xl);
	}

	.success-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-lg);
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.preview-toggle {
		background: none;
		border: 1px solid var(--color-border);
		color: var(--color-text-muted);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.preview-toggle:hover {
		color: var(--color-text-normal);
		border-color: var(--color-primary);
	}

	.markdown-preview {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		min-height: 200px;
		line-height: 1.6;
	}

	.markdown-preview .placeholder {
		color: var(--color-text-faint);
	}

	.markdown-preview :global(h1),
	.markdown-preview :global(h2),
	.markdown-preview :global(h3) {
		font-weight: 600;
		margin-top: var(--space-md);
		margin-bottom: var(--space-sm);
	}

	.markdown-preview :global(h1) {
		font-size: 1.5rem;
	}
	.markdown-preview :global(h2) {
		font-size: 1.25rem;
	}
	.markdown-preview :global(h3) {
		font-size: 1.125rem;
	}

	.markdown-preview :global(p) {
		margin-bottom: var(--space-md);
	}

	.markdown-preview :global(code) {
		background-color: var(--color-bg-elevated);
		padding: 0.2em 0.4em;
		border-radius: var(--radius-sm);
		font-size: 0.875em;
		font-family: var(--font-mono);
	}

	.markdown-preview :global(pre) {
		background-color: var(--color-bg-elevated);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		margin-bottom: var(--space-md);
	}

	.markdown-preview :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-preview :global(ul),
	.markdown-preview :global(ol) {
		padding-left: var(--space-xl);
		margin-bottom: var(--space-md);
	}

	.markdown-preview :global(li) {
		margin-bottom: var(--space-xs);
	}

	.markdown-preview :global(blockquote) {
		border-left: 3px solid var(--color-border);
		padding-left: var(--space-md);
		margin-left: 0;
		color: var(--color-text-muted);
	}

	.markdown-preview :global(a) {
		color: var(--color-primary);
	}

	input,
	textarea,
	select {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		color: var(--color-text-normal);
		font-size: 0.875rem;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	select {
		padding-right: 40px;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		cursor: pointer;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--focus-ring);
	}

	.file-input-wrapper {
		position: relative;
	}

	.file-input-wrapper input[type='file'] {
		position: absolute;
		inset: 0;
		opacity: 0;
		cursor: pointer;
	}

	.file-input-display {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		color: var(--color-text-muted);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.file-input-wrapper:hover .file-input-display {
		border-color: var(--color-primary);
		background-color: rgba(97, 125, 250, 0.05);
	}

	small {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.field-error {
		font-size: 0.8125rem;
		color: var(--color-error);
		margin-top: var(--space-xs);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: #5068d9;
	}

	.btn-secondary {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-elevated);
	}

	.btn-submit {
		margin-top: var(--space-md);
	}

	.spinner {
		width: 16px;
		height: 16px;
	}

	@media (max-width: 768px) {
		.page-header-content {
			padding: var(--space-lg);
		}

		.content {
			padding: var(--space-lg);
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.success-actions {
			flex-direction: column;
		}
	}
</style>

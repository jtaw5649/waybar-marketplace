<script lang="ts">
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const categories = [
		'system',
		'hardware',
		'network',
		'audio',
		'power',
		'time',
		'workspace',
		'window',
		'tray',
		'weather',
		'productivity',
		'media',
		'custom'
	];

	let name = $state('');
	let description = $state('');
	let category = $state('custom');
	let repoUrl = $state('');
	let version = $state('1.0.0');
	let packageFile: File | null = $state(null);
	let changelog = $state('');

	let loading = $state(false);
	let error: string | null = $state(null);
	let success = $state(false);

	function generateUuid(): string {
		const moduleName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
		const author = data.session?.user?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'anonymous';
		return `${moduleName}@${author}`;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!packageFile) {
			error = 'Please select a package file';
			return;
		}

		loading = true;
		error = null;

		try {
			const uuid = generateUuid();

			const createRes = await fetch(`${API_BASE_URL}/api/v1/modules`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					uuid,
					name,
					description,
					category,
					repo_url: repoUrl
				})
			});

			if (!createRes.ok) {
				const text = await createRes.text();
				throw new Error(text || 'Failed to create module');
			}

			const uploadRes = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/versions/${version}/upload`,
				{
					method: 'POST',
					credentials: 'include',
					body: await packageFile.arrayBuffer()
				}
			);

			if (!uploadRes.ok) {
				const text = await uploadRes.text();
				throw new Error(text || 'Failed to upload package');
			}

			const publishRes = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(uuid)}/versions/${version}/publish`,
				{
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ changelog: changelog || null })
				}
			);

			if (!publishRes.ok) {
				const text = await publishRes.text();
				throw new Error(text || 'Failed to publish version');
			}

			success = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		packageFile = target.files?.[0] || null;
	}
</script>

<main>
	<header>
		<h1>Upload Module</h1>
		<p>Share your Waybar module with the community</p>
	</header>

	<section class="content">
		{#if success}
			<div class="success-message">
				<h2>Module Published!</h2>
				<p>Your module has been successfully published to the registry.</p>
				<a href="/browse" class="btn btn-primary">Browse Modules</a>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				{#if error}
					<div class="error">{error}</div>
				{/if}

				<div class="form-group">
					<label for="name">Module Name</label>
					<input
						type="text"
						id="name"
						bind:value={name}
						placeholder="My Awesome Module"
						required
						maxlength="100"
					/>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={description}
						placeholder="A brief description of what your module does..."
						required
						maxlength="1000"
						rows="3"
					></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="category">Category</label>
						<select id="category" bind:value={category}>
							{#each categories as cat}
								<option value={cat}>{cat}</option>
							{/each}
						</select>
					</div>

					<div class="form-group">
						<label for="version">Version</label>
						<input
							type="text"
							id="version"
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
						bind:value={repoUrl}
						placeholder="https://github.com/user/repo"
						required
					/>
				</div>

				<div class="form-group">
					<label for="package">Package File (.tar.gz)</label>
					<input
						type="file"
						id="package"
						accept=".tar.gz,.tgz"
						onchange={handleFileChange}
						required
					/>
					<small>Max 10MB. Must be a valid tar.gz archive.</small>
				</div>

				<div class="form-group">
					<label for="changelog">Changelog (optional)</label>
					<textarea
						id="changelog"
						bind:value={changelog}
						placeholder="What's new in this version..."
						rows="2"
					></textarea>
				</div>

				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? 'Publishing...' : 'Publish Module'}
				</button>
			</form>
		{/if}
	</section>
</main>

<style>
	main {
		min-height: 100vh;
	}

	header {
		padding: var(--space-xl) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
	}

	header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	header p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.content {
		padding: var(--space-2xl);
		max-width: 600px;
		margin: 0 auto;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
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

	input,
	textarea,
	select {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		font-size: 0.875rem;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	small {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.error {
		padding: var(--space-md);
		background-color: rgba(var(--color-error-rgb, 239, 68, 68), 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: 0.875rem;
	}

	.btn {
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
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
		background-color: #4f6ce8;
	}

	.success-message {
		text-align: center;
		padding: var(--space-2xl);
	}

	.success-message h2 {
		color: var(--color-success, #22c55e);
		margin-bottom: var(--space-md);
	}

	.success-message p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xl);
	}
</style>

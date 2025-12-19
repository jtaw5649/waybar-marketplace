<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { toast } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	let activeTab: 'modules' | 'collections' | 'settings' = $state('modules');

	let displayName = $state('');
	let bio = $state('');
	let websiteUrl = $state('');
	let saving = $state(false);

	let profile = $derived(data.profile);
	let modules = $derived(data.modules || []);
	let collections = $derived(data.collections || []);

	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let showDeleteModal = $state(false);
	let selectedCollection: { id: number; name: string; description: string | null; visibility: string } | null = $state(null);
	let newCollectionName = $state('');
	let newCollectionDescription = $state('');
	let newCollectionVisibility = $state('private');
	let savingCollection = $state(false);

	onMount(() => {
		displayName = data.profile?.display_name || '';
		bio = data.profile?.bio || '';
		websiteUrl = data.profile?.website_url || '';
	});

	function formatDownloads(n: number): string {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return n.toString();
	}

	function formatVersion(v: { major: number; minor: number; patch: number } | null): string {
		if (!v) return '0.0.0';
		return `${v.major}.${v.minor}.${v.patch}`;
	}

	function getTotalDownloads(): number {
		return modules.reduce((sum, m) => sum + m.downloads, 0);
	}

	function openEditModal(collection: typeof selectedCollection) {
		selectedCollection = collection;
		newCollectionName = collection?.name || '';
		newCollectionDescription = collection?.description || '';
		newCollectionVisibility = collection?.visibility || 'private';
		showEditModal = true;
	}

	function openDeleteModal(collection: typeof selectedCollection) {
		selectedCollection = collection;
		showDeleteModal = true;
	}

	function resetCreateForm() {
		newCollectionName = '';
		newCollectionDescription = '';
		newCollectionVisibility = 'private';
	}

	function getVisibilityIcon(visibility: string): string {
		switch (visibility) {
			case 'public':
				return 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z';
			case 'unlisted':
				return 'M12 5C6.48 5 2 8.58 2 12s4.48 7 10 7 10-3.58 10-7-4.48-7-10-7zm0 12c-4.41 0-8-2.69-8-5s3.59-5 8-5 8 2.69 8 5-3.59 5-8 5z';
			default:
				return 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z';
		}
	}

	function getVisibilityLabel(visibility: string): string {
		switch (visibility) {
			case 'public':
				return 'Public';
			case 'unlisted':
				return 'Unlisted';
			default:
				return 'Private';
		}
	}
</script>

<Header session={data.session} />

<main id="main-content">
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
			<p>You need to log in to access your dashboard.</p>
			<a href="/login" class="btn btn-primary">Log In with GitHub</a>
		</div>
	{:else}
		<div class="dashboard">
			<aside class="sidebar">
				<div class="user-card">
					{#if data.session.user.image}
						<img src={data.session.user.image} alt="" class="avatar" />
					{:else}
						<div class="avatar-placeholder">
							{data.session.user.name?.charAt(0).toUpperCase() || 'U'}
						</div>
					{/if}
					<div class="user-info">
						<p class="name">{profile?.display_name || data.session.user.name}</p>
						<p class="username">@{profile?.username || ''}</p>
						{#if profile?.verified_author}
							<Badge variant="primary" size="sm">
								<svg
									viewBox="0 0 24 24"
									width="10"
									height="10"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
								Verified
							</Badge>
						{/if}
					</div>
				</div>

				<nav class="sidebar-nav">
					<button
						class="nav-item"
						class:active={activeTab === 'modules'}
						onclick={() => (activeTab = 'modules')}
					>
						<svg
							viewBox="0 0 24 24"
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<line x1="3" y1="9" x2="21" y2="9" />
							<line x1="9" y1="21" x2="9" y2="9" />
						</svg>
						My Modules
					</button>
					<button
						class="nav-item"
						class:active={activeTab === 'collections'}
						onclick={() => (activeTab = 'collections')}
					>
						<svg
							viewBox="0 0 24 24"
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
						</svg>
						Collections
					</button>
					<button
						class="nav-item"
						class:active={activeTab === 'settings'}
						onclick={() => (activeTab = 'settings')}
					>
						<svg
							viewBox="0 0 24 24"
							width="18"
							height="18"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="3" />
							<path
								d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
							/>
						</svg>
						Settings
					</button>
				</nav>

				<div class="stats">
					<div class="stat">
						<span class="stat-value">{modules.length}</span>
						<span class="stat-label">Modules</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatDownloads(getTotalDownloads())}</span>
						<span class="stat-label">Downloads</span>
					</div>
				</div>
			</aside>

			<section class="content">
				{#if activeTab === 'modules'}
					<div class="content-header">
						<h1>My Modules</h1>
						<a href="/upload" class="btn btn-primary">
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							Upload New Module
						</a>
					</div>

					{#if modules.length === 0}
						<div class="empty-state">
							<div class="empty-icon">
								<svg
									viewBox="0 0 24 24"
									width="48"
									height="48"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<line x1="3" y1="9" x2="21" y2="9" />
									<line x1="9" y1="21" x2="9" y2="9" />
								</svg>
							</div>
							<h3>No modules yet</h3>
							<p>Start by uploading your first module to share with the community.</p>
							<a href="/upload" class="btn btn-primary">Upload Module</a>
						</div>
					{:else}
						<div class="modules-list">
							{#each modules as module (module.uuid)}
								<a href="/modules/{encodeURIComponent(module.uuid)}" class="module-row">
									<div class="module-info">
										<h3>{module.name}</h3>
										<p class="module-uuid">{module.uuid}</p>
									</div>
									<div class="module-meta">
										<span class="version">v{formatVersion(module.version)}</span>
										<span class="category">{module.category}</span>
										<span class="downloads">
											<svg
												viewBox="0 0 24 24"
												width="14"
												height="14"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
											>
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="7 10 12 15 17 10" />
												<line x1="12" y1="15" x2="12" y2="3" />
											</svg>
											{formatDownloads(module.downloads)}
										</span>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				{:else if activeTab === 'collections'}
					<div class="content-header">
						<h1>My Collections</h1>
						<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
							<svg
								viewBox="0 0 24 24"
								width="18"
								height="18"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							New Collection
						</button>
					</div>

					{#if collections.length === 0}
						<div class="empty-state">
							<div class="empty-icon">
								<svg
									viewBox="0 0 24 24"
									width="48"
									height="48"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
								</svg>
							</div>
							<h3>No collections yet</h3>
							<p>Create collections to organize and share your favorite modules.</p>
							<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
								Create Collection
							</button>
						</div>
					{:else}
						<div class="collections-list">
							{#each collections as collection (collection.id)}
								<div class="collection-row">
									<div class="collection-info">
										<div class="collection-header">
											<h3>{collection.name}</h3>
											<span class="visibility-badge" title={getVisibilityLabel(collection.visibility)}>
												<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
													<path d={getVisibilityIcon(collection.visibility)} />
												</svg>
												{getVisibilityLabel(collection.visibility)}
											</span>
										</div>
										{#if collection.description}
											<p class="collection-description">{collection.description}</p>
										{/if}
										<p class="collection-meta">
											{collection.module_count} module{collection.module_count !== 1 ? 's' : ''}
										</p>
									</div>
									<div class="collection-actions">
										<a href="/collections/{collection.id}" class="btn btn-secondary btn-small">
											View
										</a>
										<button
											class="btn btn-secondary btn-small"
											onclick={() => openEditModal(collection)}
										>
											Edit
										</button>
										<button
											class="btn btn-danger btn-small"
											onclick={() => openDeleteModal(collection)}
										>
											Delete
										</button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{:else if activeTab === 'settings'}
					<div class="content-header">
						<h1>Profile Settings</h1>
					</div>

					<form
						class="settings-form"
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							saving = true;
							return async ({ result }) => {
								saving = false;
								if (result.type === 'success') {
									toast.success('Profile saved successfully!');
									if (profile) {
										profile = {
											...profile,
											display_name: displayName || null,
											bio: bio || null,
											website_url: websiteUrl || null
										};
									}
								} else {
									toast.error('Failed to save profile');
								}
							};
						}}
					>
						<div class="form-group">
							<label for="displayName">Display Name</label>
							<input
								type="text"
								id="displayName"
								name="display_name"
								bind:value={displayName}
								placeholder="Your display name"
								maxlength="50"
							/>
							<p class="help-text">
								This name will be shown on your profile instead of your GitHub username.
							</p>
						</div>

						<div class="form-group">
							<label for="bio">Bio</label>
							<textarea
								id="bio"
								name="bio"
								bind:value={bio}
								placeholder="Tell us about yourself..."
								rows="4"
								maxlength="500"
							></textarea>
							<p class="help-text">A short bio to display on your profile page.</p>
						</div>

						<div class="form-group">
							<label for="websiteUrl">Website URL</label>
							<input
								type="url"
								id="websiteUrl"
								name="website_url"
								bind:value={websiteUrl}
								placeholder="https://example.com"
							/>
							<p class="help-text">Your personal website or blog.</p>
						</div>

						<div class="form-actions">
							<button type="submit" class="btn btn-primary" disabled={saving}>
								{#if saving}
									<span class="spinner"></span>
									Saving...
								{:else}
									Save Changes
								{/if}
							</button>
						</div>
					</form>

					<div class="profile-link-section">
						<h3>Public Profile</h3>
						<p>View your public profile as others see it.</p>
						{#if profile?.username}
							<a href="/users/{profile.username}" class="btn btn-secondary">
								<svg
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
									<polyline points="15 3 21 3 21 9" />
									<line x1="10" y1="14" x2="21" y2="3" />
								</svg>
								View Public Profile
							</a>
						{/if}
					</div>
				{/if}
			</section>
		</div>
	{/if}
</main>

{#if showCreateModal}
	<Modal open={showCreateModal} title="Create Collection" onclose={() => { showCreateModal = false; resetCreateForm(); }}>
		<form
			method="POST"
			action="?/createCollection"
			use:enhance={() => {
				savingCollection = true;
				return async ({ result, update }) => {
					savingCollection = false;
					if (result.type === 'success') {
						toast.success('Collection created!');
						showCreateModal = false;
						resetCreateForm();
						await update();
					} else {
						toast.error('Failed to create collection');
					}
				};
			}}
		>
			<div class="form-group">
				<label for="collection-name">Name</label>
				<input
					type="text"
					id="collection-name"
					name="name"
					bind:value={newCollectionName}
					placeholder="My Favorites"
					required
					maxlength="100"
				/>
			</div>

			<div class="form-group">
				<label for="collection-description">Description</label>
				<textarea
					id="collection-description"
					name="description"
					bind:value={newCollectionDescription}
					placeholder="A collection of my favorite modules..."
					rows="3"
					maxlength="500"
				></textarea>
			</div>

			<div class="form-group">
				<label for="collection-visibility">Visibility</label>
				<select id="collection-visibility" name="visibility" bind:value={newCollectionVisibility}>
					<option value="private">Private - Only you can see</option>
					<option value="unlisted">Unlisted - Anyone with link can see</option>
					<option value="public">Public - Visible on your profile</option>
				</select>
			</div>

			<div class="modal-actions">
				<button type="button" class="btn btn-secondary" onclick={() => { showCreateModal = false; resetCreateForm(); }}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary" disabled={savingCollection || !newCollectionName.trim()}>
					{savingCollection ? 'Creating...' : 'Create Collection'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

{#if showEditModal && selectedCollection}
	<Modal open={showEditModal} title="Edit Collection" onclose={() => { showEditModal = false; selectedCollection = null; }}>
		<form
			method="POST"
			action="?/updateCollection"
			use:enhance={() => {
				savingCollection = true;
				return async ({ result, update }) => {
					savingCollection = false;
					if (result.type === 'success') {
						toast.success('Collection updated!');
						showEditModal = false;
						selectedCollection = null;
						await update();
					} else {
						toast.error('Failed to update collection');
					}
				};
			}}
		>
			<input type="hidden" name="id" value={selectedCollection.id} />

			<div class="form-group">
				<label for="edit-collection-name">Name</label>
				<input
					type="text"
					id="edit-collection-name"
					name="name"
					bind:value={newCollectionName}
					placeholder="My Favorites"
					required
					maxlength="100"
				/>
			</div>

			<div class="form-group">
				<label for="edit-collection-description">Description</label>
				<textarea
					id="edit-collection-description"
					name="description"
					bind:value={newCollectionDescription}
					placeholder="A collection of my favorite modules..."
					rows="3"
					maxlength="500"
				></textarea>
			</div>

			<div class="form-group">
				<label for="edit-collection-visibility">Visibility</label>
				<select id="edit-collection-visibility" name="visibility" bind:value={newCollectionVisibility}>
					<option value="private">Private - Only you can see</option>
					<option value="unlisted">Unlisted - Anyone with link can see</option>
					<option value="public">Public - Visible on your profile</option>
				</select>
			</div>

			<div class="modal-actions">
				<button type="button" class="btn btn-secondary" onclick={() => { showEditModal = false; selectedCollection = null; }}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary" disabled={savingCollection || !newCollectionName.trim()}>
					{savingCollection ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

{#if showDeleteModal && selectedCollection}
	<Modal open={showDeleteModal} title="Delete Collection" onclose={() => { showDeleteModal = false; selectedCollection = null; }}>
		<p class="delete-warning">
			Are you sure you want to delete "<strong>{selectedCollection.name}</strong>"? This action cannot be undone.
		</p>
		<form
			method="POST"
			action="?/deleteCollection"
			use:enhance={() => {
				savingCollection = true;
				return async ({ result, update }) => {
					savingCollection = false;
					if (result.type === 'success') {
						toast.success('Collection deleted');
						showDeleteModal = false;
						selectedCollection = null;
						await update();
					} else {
						toast.error('Failed to delete collection');
					}
				};
			}}
		>
			<input type="hidden" name="id" value={selectedCollection.id} />

			<div class="modal-actions">
				<button type="button" class="btn btn-secondary" onclick={() => { showDeleteModal = false; selectedCollection = null; }}>
					Cancel
				</button>
				<button type="submit" class="btn btn-danger" disabled={savingCollection}>
					{savingCollection ? 'Deleting...' : 'Delete Collection'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

<Footer />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.auth-required {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--space-3xl);
	}

	.auth-icon {
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

	.auth-required h2 {
		margin-bottom: var(--space-md);
	}

	.auth-required p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xl);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: #5068d9;
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-elevated);
	}

	.dashboard {
		display: flex;
		flex: 1;
	}

	.sidebar {
		width: 280px;
		background-color: var(--color-bg-surface);
		border-right: 1px solid var(--color-border);
		padding: var(--space-xl);
		flex-shrink: 0;
	}

	.user-card {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
	}

	.avatar-placeholder {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.user-info .name {
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.user-info .username {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-xl);
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		text-align: left;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.nav-item:hover {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.nav-item.active {
		background-color: var(--color-primary);
		color: white;
	}

	.stats {
		display: flex;
		gap: var(--space-md);
	}

	.stat {
		flex: 1;
		text-align: center;
		padding: var(--space-md);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
	}

	.stat-value {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: var(--space-xs);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.content {
		flex: 1;
		padding: var(--space-2xl);
		max-width: 900px;
	}

	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xl);
	}

	.content-header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-3xl);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.empty-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background-color: var(--color-bg-elevated);
		border-radius: 50%;
		margin-bottom: var(--space-lg);
	}

	.empty-icon svg {
		color: var(--color-text-muted);
	}

	.empty-state h3 {
		margin-bottom: var(--space-md);
	}

	.empty-state p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xl);
	}

	.modules-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.module-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.module-row:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-elevated);
	}

	.module-info h3 {
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.module-uuid {
		font-size: 0.75rem;
		color: var(--color-text-faint);
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
	}

	.module-meta {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.version {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
	}

	.category {
		background-color: var(--color-bg-base);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.downloads {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.settings-form {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		margin-bottom: var(--space-xl);
	}

	.form-group {
		margin-bottom: var(--space-lg);
	}

	.form-group label {
		display: block;
		font-weight: 500;
		margin-bottom: var(--space-sm);
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-normal);
		font-size: 0.875rem;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(97, 125, 250, 0.15);
	}

	.help-text {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: var(--space-sm);
	}

	.form-actions {
		margin-top: var(--space-xl);
	}

	.profile-link-section {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
	}

	.profile-link-section h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--space-sm);
	}

	.profile-link-section p {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.collections-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.collection-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.collection-row:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-elevated);
	}

	.collection-info {
		flex: 1;
	}

	.collection-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-sm);
	}

	.collection-header h3 {
		font-weight: 600;
	}

	.visibility-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		background-color: var(--color-bg-base);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.visibility-badge svg {
		opacity: 0.7;
	}

	.collection-description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-sm);
	}

	.collection-meta {
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.collection-actions {
		display: flex;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	.btn-small {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.75rem;
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}

	.btn-danger:hover {
		background-color: #c53030;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-md);
		margin-top: var(--space-xl);
	}

	.delete-warning {
		color: var(--color-text-normal);
		margin-bottom: var(--space-lg);
	}

	.delete-warning strong {
		color: var(--color-error);
	}

	select {
		width: 100%;
		padding: var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-normal);
		font-size: 0.875rem;
		cursor: pointer;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(97, 125, 250, 0.15);
	}

	@media (max-width: 768px) {
		.dashboard {
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			border-right: none;
			border-bottom: 1px solid var(--color-border);
		}

		.content {
			padding: var(--space-lg);
		}

		.content-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}

		.module-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}

		.collection-row {
			flex-direction: column;
			gap: var(--space-md);
		}

		.collection-actions {
			width: 100%;
			justify-content: flex-start;
		}
	}
</style>

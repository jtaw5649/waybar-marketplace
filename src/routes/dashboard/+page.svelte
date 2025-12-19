<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface Module {
		uuid: string;
		name: string;
		author: string;
		description: string;
		category: string;
		downloads: number;
		rating: number | null;
		version: { major: number; minor: number; patch: number } | null;
	}

	interface UserProfile {
		id: number;
		username: string;
		display_name: string | null;
		avatar_url: string | null;
		bio: string | null;
		website_url: string | null;
		verified_author: boolean;
		module_count: number;
		created_at: string;
	}

	let modules: Module[] = $state([]);
	let profile: UserProfile | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);
	let activeTab: 'modules' | 'settings' = $state('modules');

	let displayName = $state('');
	let bio = $state('');
	let websiteUrl = $state('');
	let saving = $state(false);
	let saveMessage: { type: 'success' | 'error'; text: string } | null = $state(null);

	$effect(() => {
		if (data.session?.user) {
			fetchDashboardData();
		}
	});

	async function fetchDashboardData() {
		try {
			const [profileRes, modulesRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/v1/users/me`, { credentials: 'include' }),
				fetch(`${API_BASE_URL}/api/v1/modules/mine`, { credentials: 'include' })
			]);

			if (profileRes.ok) {
				const profileData = await profileRes.json();
				profile = profileData;
				displayName = profileData.display_name || '';
				bio = profileData.bio || '';
				websiteUrl = profileData.website_url || '';
			}

			if (modulesRes.ok) {
				const modulesData = await modulesRes.json();
				modules = modulesData.modules || [];
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function saveProfile() {
		saving = true;
		saveMessage = null;

		try {
			const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
				method: 'PATCH',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					display_name: displayName || null,
					bio: bio || null,
					website_url: websiteUrl || null
				})
			});

			if (res.ok) {
				saveMessage = { type: 'success', text: 'Profile saved successfully!' };
				if (profile) {
					profile = {
						...profile,
						display_name: displayName || null,
						bio: bio || null,
						website_url: websiteUrl || null
					};
				}
			} else {
				saveMessage = { type: 'error', text: 'Failed to save profile' };
			}
		} catch (e) {
			saveMessage = { type: 'error', text: 'Network error' };
		} finally {
			saving = false;
		}
	}

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
</script>

<main>
	<header>
		<a href="/" class="logo">Waybar Modules</a>
		<div class="header-right">
			{#if data.session?.user}
				<a href="/upload" class="btn btn-small">Upload Module</a>
				<span class="user-name">{data.session.user.name}</span>
				<button class="btn btn-small" onclick={() => signOut()}>Sign Out</button>
			{/if}
		</div>
	</header>

	{#if !data.session?.user}
		<div class="auth-required">
			<h2>Sign In Required</h2>
			<p>You need to sign in to access your dashboard.</p>
			<a href="/login" class="btn btn-primary">Sign In with GitHub</a>
		</div>
	{:else if loading}
		<div class="loading">Loading dashboard...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="dashboard">
			<aside class="sidebar">
				<div class="user-card">
					{#if data.session.user.image}
						<img src={data.session.user.image} alt="" class="avatar" />
					{/if}
					<div class="user-info">
						<p class="name">{profile?.display_name || data.session.user.name}</p>
						<p class="username">@{profile?.username || ''}</p>
						{#if profile?.verified_author}
							<span class="verified">Verified Author</span>
						{/if}
					</div>
				</div>

				<nav class="sidebar-nav">
					<button
						class="nav-item"
						class:active={activeTab === 'modules'}
						onclick={() => (activeTab = 'modules')}
					>
						My Modules
					</button>
					<button
						class="nav-item"
						class:active={activeTab === 'settings'}
						onclick={() => (activeTab = 'settings')}
					>
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
						<a href="/upload" class="btn btn-primary">Upload New Module</a>
					</div>

					{#if modules.length === 0}
						<div class="empty-state">
							<h3>No modules yet</h3>
							<p>Start by uploading your first module to share with the community.</p>
							<a href="/upload" class="btn btn-primary">Upload Module</a>
						</div>
					{:else}
						<div class="modules-list">
							{#each modules as module}
								<a href="/modules/{encodeURIComponent(module.uuid)}" class="module-row">
									<div class="module-info">
										<h3>{module.name}</h3>
										<p class="module-uuid">{module.uuid}</p>
									</div>
									<div class="module-meta">
										<span class="version">v{formatVersion(module.version)}</span>
										<span class="category">{module.category}</span>
										<span class="downloads">{formatDownloads(module.downloads)} downloads</span>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				{:else if activeTab === 'settings'}
					<div class="content-header">
						<h1>Profile Settings</h1>
					</div>

					<form class="settings-form" onsubmit={(e) => { e.preventDefault(); saveProfile(); }}>
						{#if saveMessage}
							<div class="message" class:success={saveMessage.type === 'success'} class:error={saveMessage.type === 'error'}>
								{saveMessage.text}
							</div>
						{/if}

						<div class="form-group">
							<label for="displayName">Display Name</label>
							<input
								type="text"
								id="displayName"
								bind:value={displayName}
								placeholder="Your display name"
								maxlength="50"
							/>
							<p class="help-text">This name will be shown on your profile instead of your GitHub username.</p>
						</div>

						<div class="form-group">
							<label for="bio">Bio</label>
							<textarea
								id="bio"
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
								bind:value={websiteUrl}
								placeholder="https://example.com"
							/>
							<p class="help-text">Your personal website or blog.</p>
						</div>

						<div class="form-actions">
							<button type="submit" class="btn btn-primary" disabled={saving}>
								{saving ? 'Saving...' : 'Save Changes'}
							</button>
						</div>
					</form>

					<div class="danger-zone">
						<h3>Public Profile</h3>
						<p>View your public profile as others see it.</p>
						{#if profile?.username}
							<a href="/users/{profile.username}" class="btn btn-secondary">View Public Profile</a>
						{/if}
					</div>
				{/if}
			</section>
		</div>
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}

	header {
		padding: var(--space-md) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--color-bg-base);
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-normal);
		text-decoration: none;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.user-name {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.btn-small {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-normal);
		text-decoration: none;
	}

	.btn-small:hover {
		background-color: var(--color-bg-elevated);
	}

	.auth-required,
	.loading,
	.error {
		text-align: center;
		padding: var(--space-3xl);
	}

	.auth-required h2 {
		margin-bottom: var(--space-md);
	}

	.auth-required p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-xl);
	}

	.btn {
		display: inline-block;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		text-decoration: none;
		border: none;
		cursor: pointer;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: #4f6ce8;
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

	.dashboard {
		display: flex;
		min-height: calc(100vh - 60px);
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

	.user-info .name {
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.user-info .username {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.verified {
		display: inline-block;
		margin-top: var(--space-xs);
		font-size: 0.75rem;
		color: var(--color-primary);
		background-color: var(--color-bg-elevated);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-xl);
	}

	.nav-item {
		display: block;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		text-align: left;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
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
		transition: all 0.15s ease;
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
		font-family: monospace;
	}

	.module-meta {
		display: flex;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.version {
		font-family: monospace;
	}

	.category {
		background-color: var(--color-bg-base);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.settings-form {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		margin-bottom: var(--space-xl);
	}

	.message {
		padding: var(--space-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-lg);
	}

	.message.success {
		background-color: rgba(16, 185, 129, 0.1);
		color: #10b981;
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.message.error {
		background-color: rgba(239, 68, 68, 0.1);
		color: var(--color-error);
		border: 1px solid rgba(239, 68, 68, 0.2);
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
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.help-text {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: var(--space-sm);
	}

	.form-actions {
		margin-top: var(--space-xl);
	}

	.danger-zone {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
	}

	.danger-zone h3 {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--space-sm);
	}

	.danger-zone p {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
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

		.module-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}
	}
</style>

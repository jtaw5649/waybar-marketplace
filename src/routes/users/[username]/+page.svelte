<script lang="ts">
	import { page } from '$app/stores';
	import { API_BASE_URL } from '$lib';

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

	interface Module {
		uuid: string;
		name: string;
		author: string;
		description: string;
		category: string;
		downloads: number;
		rating: number | null;
		verified_author: boolean;
	}

	let profile: UserProfile | null = $state(null);
	let modules: Module[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	$effect(() => {
		const username = $page.params.username;
		if (username) {
			fetchUserData(username);
		}
	});

	async function fetchUserData(username: string) {
		loading = true;
		error = null;

		try {
			const [profileRes, modulesRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/v1/users/${username}`),
				fetch(`${API_BASE_URL}/api/v1/users/${username}/modules`)
			]);

			if (!profileRes.ok) {
				if (profileRes.status === 404) {
					throw new Error('User not found');
				}
				throw new Error('Failed to fetch user profile');
			}

			const profileData = await profileRes.json();
			profile = profileData;

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

	function formatDownloads(n: number): string {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return n.toString();
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long'
		});
	}
</script>

<main>
	<nav class="breadcrumb">
		<a href="/">Home</a>
		<span>/</span>
		<span>User Profile</span>
	</nav>

	{#if loading}
		<div class="loading">Loading profile...</div>
	{:else if error}
		<div class="error">
			<h2>Error</h2>
			<p>{error}</p>
			<a href="/" class="btn btn-primary">Go Home</a>
		</div>
	{:else if profile}
		<header class="profile-header">
			<div class="profile-info">
				{#if profile.avatar_url}
					<img src={profile.avatar_url} alt={profile.username} class="avatar" />
				{:else}
					<div class="avatar-placeholder">{profile.username.charAt(0).toUpperCase()}</div>
				{/if}
				<div class="profile-details">
					<div class="name-row">
						<h1>{profile.display_name || profile.username}</h1>
						{#if profile.verified_author}
							<span class="verified" title="Verified Author">&#10003; Verified</span>
						{/if}
					</div>
					<p class="username">@{profile.username}</p>
					{#if profile.bio}
						<p class="bio">{profile.bio}</p>
					{/if}
					<div class="profile-meta">
						<span class="meta-item">
							<strong>{profile.module_count}</strong> modules
						</span>
						<span class="meta-item">
							Member since {formatDate(profile.created_at)}
						</span>
						{#if profile.website_url}
							<a href={profile.website_url} target="_blank" rel="noopener noreferrer" class="website-link">
								{profile.website_url.replace(/^https?:\/\//, '')}
							</a>
						{/if}
					</div>
				</div>
			</div>
		</header>

		<section class="modules-section">
			<h2>Modules by {profile.display_name || profile.username}</h2>
			{#if modules.length === 0}
				<div class="empty-state">
					<p>No modules published yet</p>
				</div>
			{:else}
				<div class="grid">
					{#each modules as module}
						<a href="/modules/{encodeURIComponent(module.uuid)}" class="card">
							<div class="card-header">
								<h3>{module.name}</h3>
								{#if module.verified_author}
									<span class="verified-badge" title="Verified Author">&#10003;</span>
								{/if}
							</div>
							<p class="description">{module.description}</p>
							<div class="meta">
								<span class="category">{module.category}</span>
								<span class="downloads">{formatDownloads(module.downloads)} downloads</span>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-xl);
	}

	.breadcrumb {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-xl);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.breadcrumb a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.loading,
	.error {
		text-align: center;
		padding: var(--space-3xl);
	}

	.error h2 {
		margin-bottom: var(--space-md);
		color: var(--color-error);
	}

	.error p {
		margin-bottom: var(--space-xl);
		color: var(--color-text-muted);
	}

	.btn {
		display: inline-block;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		text-decoration: none;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.profile-header {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		margin-bottom: var(--space-2xl);
	}

	.profile-info {
		display: flex;
		gap: var(--space-xl);
		align-items: flex-start;
	}

	.avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.avatar-placeholder {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background-color: var(--color-primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.profile-details {
		flex: 1;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-xs);
	}

	.name-row h1 {
		font-size: 1.75rem;
		font-weight: 700;
	}

	.verified {
		background-color: var(--color-primary);
		color: white;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		font-size: 0.75rem;
		font-weight: 500;
	}

	.username {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-bottom: var(--space-md);
	}

	.bio {
		color: var(--color-text-normal);
		line-height: 1.6;
		margin-bottom: var(--space-md);
		max-width: 600px;
	}

	.profile-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.meta-item strong {
		color: var(--color-text-normal);
	}

	.website-link {
		color: var(--color-primary);
		text-decoration: none;
	}

	.website-link:hover {
		text-decoration: underline;
	}

	.modules-section {
		margin-top: var(--space-xl);
	}

	.modules-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--space-lg);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-2xl);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-muted);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-lg);
	}

	.card {
		display: block;
		padding: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: inherit;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.card:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-elevated);
		text-decoration: none;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-md);
	}

	.card h3 {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.verified-badge {
		color: var(--color-primary);
		font-size: 0.875rem;
	}

	.card .description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1.5;
	}

	.card .meta {
		display: flex;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--color-text-faint);
	}

	.category {
		background-color: var(--color-bg-base);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	@media (max-width: 768px) {
		main {
			padding: var(--space-md);
		}

		.profile-info {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.name-row {
			justify-content: center;
		}

		.profile-meta {
			justify-content: center;
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>

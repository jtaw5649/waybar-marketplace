<script lang="ts">
	import { page } from '$app/stores';
	import { API_BASE_URL } from '$lib';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let { data } = $props();

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

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long'
		});
	}
</script>

<Header session={data.session} />

<main id="main-content">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/">Home</a>
		<span aria-hidden="true">/</span>
		<span>User Profile</span>
	</nav>

	{#if loading}
		<div class="profile-skeleton">
			<header class="profile-header">
				<div class="profile-info">
					<Skeleton variant="avatar" class="avatar-skeleton" />
					<div class="profile-details">
						<Skeleton variant="text" class="name-skeleton" />
						<Skeleton variant="text" class="username-skeleton" />
						<Skeleton variant="text" class="bio-skeleton" />
						<Skeleton variant="text" class="bio-skeleton" />
					</div>
				</div>
			</header>
			<section class="modules-section">
				<Skeleton variant="text" class="section-title-skeleton" />
				<div class="grid">
					{#each Array(3) as _, i (i)}
						<div class="card-skeleton">
							<Skeleton variant="text" class="card-title-skeleton" />
							<Skeleton variant="text" class="card-desc-skeleton" />
							<Skeleton variant="text" class="card-desc-skeleton" />
						</div>
					{/each}
				</div>
			</section>
		</div>
	{:else if error}
		<div class="error-state">
			<div class="error-icon">
				<svg
					viewBox="0 0 24 24"
					width="48"
					height="48"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
			</div>
			<h2>Error</h2>
			<p>{error}</p>
			<a href="/" class="btn btn-primary">Go Home</a>
		</div>
	{:else if profile}
		<header class="profile-header">
			<div class="profile-info">
				{#if profile.avatar_url}
					<img src={profile.avatar_url} alt="" class="avatar" />
				{:else}
					<div class="avatar-placeholder" aria-hidden="true">
						{profile.username.charAt(0).toUpperCase()}
					</div>
				{/if}
				<div class="profile-details">
					<div class="name-row">
						<h1>{profile.display_name || profile.username}</h1>
						{#if profile.verified_author}
							<Badge variant="primary" size="sm">
								<svg
									viewBox="0 0 24 24"
									width="12"
									height="12"
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
					<p class="username">@{profile.username}</p>
					{#if profile.bio}
						<p class="bio">{profile.bio}</p>
					{/if}
					<div class="profile-meta">
						<span class="meta-item">
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<line x1="3" y1="9" x2="21" y2="9" />
								<line x1="9" y1="21" x2="9" y2="9" />
							</svg>
							<strong>{profile.module_count}</strong> modules
						</span>
						<span class="meta-item">
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
							Member since {formatDate(profile.created_at)}
						</span>
						{#if profile.website_url}
							<a
								href={profile.website_url}
								target="_blank"
								rel="noopener noreferrer"
								class="website-link"
							>
								<svg
									viewBox="0 0 24 24"
									width="16"
									height="16"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="2" y1="12" x2="22" y2="12" />
									<path
										d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
									/>
								</svg>
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
					<p>No modules published yet</p>
				</div>
			{:else}
				<div class="grid">
					{#each modules as module, i (module.uuid)}
						<ModuleCard
							uuid={module.uuid}
							name={module.name}
							author={module.author}
							description={module.description}
							category={module.category}
							downloads={module.downloads}
							verified={module.verified_author}
							delay={i * 50}
						/>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</main>

<Footer />

<style>
	main {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--space-xl);
		width: 100%;
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

	.error-state {
		text-align: center;
		padding: var(--space-3xl);
	}

	.error-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background-color: rgba(239, 68, 68, 0.1);
		border-radius: 50%;
		margin-bottom: var(--space-lg);
	}

	.error-icon svg {
		color: var(--color-error);
	}

	.error-state h2 {
		margin-bottom: var(--space-md);
		color: var(--color-error);
	}

	.error-state p {
		margin-bottom: var(--space-xl);
		color: var(--color-text-muted);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: 500;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: #5068d9;
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
		border: 3px solid var(--color-border);
	}

	.avatar-placeholder {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%);
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
		flex-wrap: wrap;
	}

	.name-row h1 {
		font-size: 1.75rem;
		font-weight: 700;
	}

	.username {
		color: var(--color-text-muted);
		font-size: 0.9375rem;
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

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.meta-item strong {
		color: var(--color-text-normal);
	}

	.meta-item svg {
		opacity: 0.6;
	}

	.website-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
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
		padding: var(--space-3xl);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-muted);
	}

	.empty-state svg {
		margin-bottom: var(--space-md);
		opacity: 0.4;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--space-lg);
	}

	.profile-skeleton .profile-header {
		margin-bottom: var(--space-2xl);
	}

	.profile-skeleton :global(.avatar-skeleton) {
		width: 120px;
		height: 120px;
		border-radius: 50%;
	}

	.profile-skeleton :global(.name-skeleton) {
		width: 200px;
		height: 28px;
		margin-bottom: var(--space-sm);
	}

	.profile-skeleton :global(.username-skeleton) {
		width: 120px;
		height: 18px;
		margin-bottom: var(--space-md);
	}

	.profile-skeleton :global(.bio-skeleton) {
		width: 100%;
		max-width: 400px;
		height: 16px;
		margin-bottom: var(--space-sm);
	}

	.profile-skeleton :global(.section-title-skeleton) {
		width: 200px;
		height: 24px;
		margin-bottom: var(--space-lg);
	}

	.card-skeleton {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.card-skeleton :global(.card-title-skeleton) {
		width: 60%;
		height: 20px;
		margin-bottom: var(--space-md);
	}

	.card-skeleton :global(.card-desc-skeleton) {
		width: 100%;
		height: 14px;
		margin-bottom: var(--space-sm);
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

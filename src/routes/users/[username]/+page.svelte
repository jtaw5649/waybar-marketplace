<script lang="ts">
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import { formatMonthYear } from '$lib/utils/formatDate';

	let { data }: { data: PageData } = $props();
</script>

<Header session={data.session} />

<main id="main-content">
	<nav class="breadcrumb" aria-label="Breadcrumb">
		<a href="/">Home</a>
		<span aria-hidden="true">/</span>
		<span>User Profile</span>
	</nav>

	<header class="profile-header">
		<div class="profile-banner"></div>
		<div class="profile-info">
			{#if data.profile.avatar_url}
				<img src={data.profile.avatar_url} alt="" class="avatar" />
			{:else}
				<div class="avatar-placeholder" aria-hidden="true">
					{data.profile.username.charAt(0).toUpperCase()}
				</div>
			{/if}
			<div class="profile-details">
				<div class="name-row">
					<h1>{data.profile.display_name || data.profile.username}</h1>
					{#if data.profile.verified_author}
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
				<p class="username">@{data.profile.username}</p>
				{#if data.profile.bio}
					<p class="bio">{data.profile.bio}</p>
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
						<strong>{data.profile.module_count}</strong> modules
					</span>
					{#if data.totalDownloads > 0}
						<span class="meta-item">
							<svg
								viewBox="0 0 24 24"
								width="16"
								height="16"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="7 10 12 15 17 10" />
								<line x1="12" y1="15" x2="12" y2="3" />
							</svg>
							<strong>{data.totalDownloads.toLocaleString()}</strong> downloads
						</span>
					{/if}
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
						Member since {formatMonthYear(data.profile.created_at)}
					</span>
				</div>

				{#if data.profile.github_url || data.profile.twitter_url || data.profile.bluesky_url || data.profile.discord_url || data.profile.website_url || data.profile.sponsor_url}
					<div class="social-links">
						{#if data.profile.github_url}
							<a
								href={data.profile.github_url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-link github"
								aria-label="GitHub profile (opens in new tab)"
							>
								<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
									<path
										d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
									/>
								</svg>
								<span>GitHub</span>
							</a>
						{/if}
						{#if data.profile.twitter_url}
							<a
								href={data.profile.twitter_url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-link twitter"
								aria-label="X/Twitter profile (opens in new tab)"
							>
								<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
									<path
										d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
									/>
								</svg>
								<span>X</span>
							</a>
						{/if}
						{#if data.profile.bluesky_url}
							<a
								href={data.profile.bluesky_url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-link bluesky"
								aria-label="Bluesky profile (opens in new tab)"
							>
								<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
									<path
										d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.272-.037.407-.052-.136.02-.272.041-.407.068-3.19.625-6.037 2.173-3.424 6.154 2.696 4.106 4.617 3.048 5.685 2.369.956-.607 3.326-2.672 3.326-5.27 0 2.598 2.37 4.663 3.326 5.27 1.068.679 2.989 1.737 5.685-2.369 2.613-3.981-.234-5.529-3.424-6.154a10.57 10.57 0 0 0-.407-.068c.135.015.27.033.407.052 2.67.296 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.48 0-.687-.139-1.859-.902-2.202-.66-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
									/>
								</svg>
								<span>Bluesky</span>
							</a>
						{/if}
						{#if data.profile.discord_url}
							<a
								href={data.profile.discord_url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-link discord"
								aria-label="Discord server (opens in new tab)"
							>
								<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
									<path
										d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
									/>
								</svg>
								<span>Discord</span>
							</a>
						{/if}
						{#if data.profile.website_url}
							<a
								href={data.profile.website_url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-link website"
								aria-label="Personal website (opens in new tab)"
							>
								<svg
									viewBox="0 0 24 24"
									width="18"
									height="18"
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
								<span
									>{data.profile.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span
								>
							</a>
						{/if}
						{#if data.profile.sponsor_url}
							<a
								href={data.profile.sponsor_url}
								target="_blank"
								rel="noopener noreferrer"
								class="social-link sponsor"
								aria-label="Support this creator (opens in new tab)"
							>
								<svg
									viewBox="0 0 24 24"
									width="18"
									height="18"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
									/>
								</svg>
								<span>Sponsor</span>
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</header>

	<section class="modules-section">
		<h2>Modules by {data.profile.display_name || data.profile.username}</h2>
		{#if data.modules.length === 0}
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
				{#each data.modules as module, i (module.uuid)}
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

	{#if data.collections && data.collections.length > 0}
		<section class="collections-section">
			<h2>Collections</h2>
			<div class="collections-grid">
				{#each data.collections as collection (collection.id)}
					<a href="/collections/{collection.id}" class="collection-card">
						<div class="collection-header">
							<svg
								viewBox="0 0 24 24"
								width="20"
								height="20"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="3" width="7" height="7" />
								<rect x="14" y="3" width="7" height="7" />
								<rect x="14" y="14" width="7" height="7" />
								<rect x="3" y="14" width="7" height="7" />
							</svg>
							<span class="collection-name">{collection.name}</span>
						</div>
						{#if collection.description}
							<p class="collection-description">{collection.description}</p>
						{/if}
						<div class="collection-meta">
							<span
								>{collection.module_count}
								{collection.module_count === 1 ? 'module' : 'modules'}</span
							>
						</div>
					</a>
				{/each}
			</div>
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
		padding-top: 5rem;
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

	.profile-header {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-2xl);
		overflow: hidden;
	}

	.profile-banner {
		height: 120px;
		background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 50%, #a855f7 100%);
		position: relative;
	}

	.profile-banner::before {
		content: '';
		position: absolute;
		inset: 0;
		background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
	}

	.profile-info {
		display: flex;
		gap: var(--space-xl);
		align-items: flex-start;
		padding: var(--space-xl);
		padding-top: 0;
		margin-top: -60px;
		position: relative;
	}

	.avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		flex-shrink: 0;
		border: 4px solid var(--color-bg-surface);
		box-shadow: var(--shadow-lg);
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
		border: 4px solid var(--color-bg-surface);
		box-shadow: var(--shadow-lg);
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

	.social-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-top: var(--space-md);
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			transform var(--duration-fast) var(--ease-out);
	}

	.social-link:hover {
		transform: translateY(-1px);
	}

	.social-link.github {
		background-color: #24292e;
		color: white;
	}

	.social-link.github:hover {
		background-color: #1b1f23;
	}

	.social-link.twitter {
		background-color: #000;
		color: white;
	}

	.social-link.twitter:hover {
		background-color: #1a1a1a;
	}

	.social-link.bluesky {
		background-color: #0085ff;
		color: white;
	}

	.social-link.bluesky:hover {
		background-color: #0073e6;
	}

	.social-link.discord {
		background-color: #5865f2;
		color: white;
	}

	.social-link.discord:hover {
		background-color: #4752c4;
	}

	.social-link.sponsor {
		background-color: #db61a2;
		color: white;
	}

	.social-link.sponsor:hover {
		background-color: #bf4b8a;
	}

	.social-link.website {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.social-link.website:hover {
		background-color: var(--color-bg-surface);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.social-link span {
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

	.collections-section {
		margin-top: var(--space-2xl);
	}

	.collections-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--space-lg);
	}

	.collections-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-md);
	}

	.collection-card {
		display: block;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		text-decoration: none;
		color: inherit;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.collection-card:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-elevated);
	}

	.collection-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.collection-header svg {
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.collection-name {
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.collection-description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.collection-meta {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	@media (max-width: 768px) {
		main {
			padding: var(--space-md);
		}

		.profile-banner {
			height: 100px;
		}

		.profile-info {
			flex-direction: column;
			align-items: center;
			text-align: center;
			margin-top: -50px;
		}

		.avatar,
		.avatar-placeholder {
			width: 100px;
			height: 100px;
			font-size: 2.5rem;
		}

		.name-row {
			justify-content: center;
		}

		.profile-meta {
			justify-content: center;
		}

		.social-links {
			justify-content: center;
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>

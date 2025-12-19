<script lang="ts">
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';

	let { data }: { data: PageData } = $props();

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
						Member since {formatDate(data.profile.created_at)}
					</span>
				</div>

				{#if data.profile.github_url || data.profile.twitter_url || data.profile.mastodon_url || data.profile.website_url}
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
						{#if data.profile.mastodon_url}
							<a
								href={data.profile.mastodon_url}
								target="_blank"
								rel="noopener noreferrer me"
								class="social-link mastodon"
								aria-label="Mastodon profile (opens in new tab)"
							>
								<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
									<path
										d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"
									/>
								</svg>
								<span>Mastodon</span>
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

	.social-link.mastodon {
		background-color: #6364ff;
		color: white;
	}

	.social-link.mastodon:hover {
		background-color: #5253e0;
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

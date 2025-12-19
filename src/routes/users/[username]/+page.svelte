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
						{#if data.profile.website_url}
							<a
								href={data.profile.website_url}
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
								{data.profile.website_url.replace(/^https?:\/\//, '')}
							</a>
						{/if}
					</div>
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

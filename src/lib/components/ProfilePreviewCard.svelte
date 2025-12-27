<script lang="ts">
	interface Props {
		displayName: string;
		username: string;
		bio: string;
		websiteUrl: string;
		avatarUrl: string | null;
		moduleCount: number;
		verified: boolean;
		profileUrl?: string;
	}

	let {
		displayName,
		username,
		bio,
		websiteUrl,
		avatarUrl,
		moduleCount,
		verified,
		profileUrl
	}: Props = $props();

	const displayedName = $derived(displayName || username);
	const truncatedBio = $derived(bio.length > 100 ? bio.slice(0, 100) + '...' : bio);
	const websiteDisplay = $derived(websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''));
</script>

<div class="profile-preview">
	<h3 class="preview-title">Profile Preview</h3>
	<div class="preview-card">
		<div class="preview-header">
			{#if avatarUrl}
				<img src={avatarUrl} alt="" class="preview-avatar" loading="lazy" />
			{:else}
				<div class="avatar-placeholder" aria-hidden="true">
					{displayedName.charAt(0).toUpperCase()}
				</div>
			{/if}
			<div class="preview-info">
				<div class="name-row">
					<span class="preview-name">{displayedName}</span>
					{#if verified}
						<span class="verified-badge" title="Verified Author">
							<svg
								viewBox="0 0 24 24"
								width="14"
								height="14"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						</span>
					{/if}
				</div>
				<span class="preview-username">@{username}</span>
			</div>
		</div>
		{#if bio}
			<p class="preview-bio">{truncatedBio}</p>
		{:else}
			<p class="preview-bio empty">No bio yet</p>
		{/if}
		<div class="preview-meta">
			<span class="meta-item">
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<line x1="3" y1="9" x2="21" y2="9" />
					<line x1="9" y1="21" x2="9" y2="9" />
				</svg>
				{moduleCount}
				{moduleCount === 1 ? 'module' : 'modules'}
			</span>
			{#if websiteUrl}
				<span class="meta-item">
					<svg
						viewBox="0 0 24 24"
						width="14"
						height="14"
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
					{websiteDisplay}
				</span>
			{/if}
		</div>
		{#if profileUrl}
			<a href={profileUrl} class="view-profile-link">
				<svg
					viewBox="0 0 24 24"
					width="14"
					height="14"
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
</div>

<style>
	.profile-preview {
		margin-top: var(--space-lg);
	}

	.preview-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.preview-card {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.preview-header {
		display: flex;
		gap: var(--space-md);
		margin-bottom: var(--space-md);
	}

	.preview-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		flex-shrink: 0;
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
		flex-shrink: 0;
	}

	.preview-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
	}

	.name-row {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.preview-name {
		font-weight: 600;
		font-size: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.verified-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background-color: var(--color-primary);
		color: white;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.preview-username {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.preview-bio {
		font-size: 0.875rem;
		color: var(--color-text-normal);
		line-height: 1.5;
		margin-bottom: var(--space-md);
	}

	.preview-bio.empty {
		color: var(--color-text-faint);
		font-style: italic;
	}

	.preview-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.meta-item svg {
		opacity: 0.6;
	}

	.view-profile-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		margin-top: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-normal);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			background-color var(--duration-fast) var(--ease-out);
	}

	.view-profile-link:hover {
		border-color: var(--color-primary);
		background-color: var(--color-bg-surface);
	}

	.view-profile-link:focus-visible {
		outline: var(--focus-ring);
		outline-offset: 2px;
	}

	.view-profile-link svg {
		opacity: 0.7;
	}
</style>

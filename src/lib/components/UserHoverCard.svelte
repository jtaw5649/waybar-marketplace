<script lang="ts">
	import { onMount } from 'svelte';
	import { userCache, type CachedUser } from '$lib/stores/userCache.svelte';

	interface Props {
		username: string;
	}

	let { username }: Props = $props();

	let user = $state<CachedUser | null>(null);
	let loading = $state(true);

	onMount(async () => {
		const cached = userCache.get(username);
		if (cached) {
			user = cached;
			loading = false;
			return;
		}

		const res = await fetch(`/api/users/${encodeURIComponent(username)}`);
		if (res.ok) {
			const data = await res.json();
			user = data.data;
			if (user) {
				userCache.set(username, user);
			}
		}
		loading = false;
	});
</script>

<div class="user-hover-card">
	{#if loading}
		<span>Loading...</span>
	{:else if user}
		<div class="user-content">
			{#if user.avatar_url}
				<img src={user.avatar_url} alt={user.display_name || user.username} class="user-avatar" />
			{/if}
			<div class="user-name">
				{user.display_name || user.username}
				{#if user.verified_author}
					<span class="verified-badge" title="Verified Author">✓</span>
				{/if}
			</div>
			<div class="user-handle">@{user.username}</div>
			{#if user.bio}
				<div class="user-bio">{user.bio}</div>
			{/if}
			<div class="user-modules">{user.module_count} modules</div>
			<a href="/users/{user.username}" class="view-profile-link">View Profile</a>
		</div>
	{/if}
</div>

<style>
	.user-hover-card {
		min-width: 200px;
	}

	.user-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.user-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.user-name {
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.verified-badge {
		color: var(--color-primary);
		font-size: 0.875rem;
	}

	.user-handle {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.user-bio {
		font-size: 0.875rem;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.user-modules {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.view-profile-link {
		font-size: 0.875rem;
		color: var(--color-primary);
		text-decoration: none;
		margin-top: var(--space-xs);
	}

	.view-profile-link:hover {
		text-decoration: underline;
	}
</style>

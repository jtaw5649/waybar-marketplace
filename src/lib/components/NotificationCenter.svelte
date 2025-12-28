<script lang="ts">
	import { Bell } from 'lucide-svelte';
	import { notificationStore } from '$lib/stores/notifications.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { goto } from '$app/navigation';
	import type { Notification } from '$lib/types';

	let isOpen = $state(false);

	function toggleOpen() {
		isOpen = !isOpen;
		if (isOpen) {
			notificationStore.syncWithServer();
		}
	}

	function handleNotificationClick(notification: Notification) {
		void notificationStore.markReadWithSync(notification.id);
		if (notification.link) {
			void goto(notification.link);
		}
	}
</script>

<div class="notification-center" use:clickOutside={{ handler: () => isOpen && (isOpen = false) }}>
	<button
		class="notification-btn"
		class:active={isOpen}
		aria-label="Notifications"
		aria-expanded={isOpen}
		onclick={toggleOpen}
	>
		<Bell size={18} />
		{#if notificationStore.unreadCount > 0}
			<span class="badge">
				{notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="dropdown">
			<div class="dropdown-header">
				<span class="dropdown-title">Notifications</span>
				{#if notificationStore.unreadCount > 0}
					<button class="mark-all-read" onclick={() => notificationStore.markAllReadWithSync()}>
						Mark all as read
					</button>
				{/if}
			</div>
			<div class="dropdown-content">
				{#if notificationStore.notifications.length === 0}
					<div class="empty-state">
						<Bell size={32} />
						<p>No notifications</p>
					</div>
				{:else}
					<ul class="notification-list">
						{#each notificationStore.notifications.filter((n) => n.status !== 'done') as notification (notification.id)}
							<li class="notification-item" class:unread={notification.status === 'unread'}>
								<button
									type="button"
									class="notification-button"
									onclick={() => handleNotificationClick(notification)}
								>
									<div class="notification-body">
										<span class="notification-title">{notification.title}</span>
										<span class="notification-message">{notification.message}</span>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.notification-center {
		position: relative;
	}

	.notification-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: none;
		border-radius: var(--radius-md);
		background-color: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
		position: relative;
	}

	.notification-btn:hover,
	.notification-btn.active {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.badge {
		position: absolute;
		top: 4px;
		right: 4px;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		font-size: 10px;
		font-weight: 600;
		line-height: 16px;
		text-align: center;
		color: white;
		background-color: var(--color-primary);
		border-radius: 8px;
	}

	.dropdown {
		position: absolute;
		top: calc(100% + var(--space-sm));
		right: 0;
		width: 380px;
		max-height: 480px;
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
		z-index: 1000;
	}

	.dropdown-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.dropdown-title {
		font-weight: 600;
		font-size: var(--font-size-sm);
		color: var(--color-text-normal);
	}

	.mark-all-read {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: var(--font-size-xs);
		cursor: pointer;
		padding: 0;
	}

	.mark-all-read:hover {
		text-decoration: underline;
	}

	.dropdown-content {
		overflow-y: auto;
		max-height: 400px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
		color: var(--color-text-muted);
		gap: var(--space-sm);
	}

	.empty-state p {
		margin: 0;
		font-size: var(--font-size-sm);
	}

	.notification-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.notification-item {
		border-bottom: 1px solid var(--color-border);
	}

	.notification-button {
		width: 100%;
		padding: var(--space-md);
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		text-align: left;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.notification-button:hover {
		background-color: var(--color-bg-elevated);
	}

	.notification-item:last-child {
		border-bottom: none;
	}

	.notification-item.unread {
		background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
	}

	.notification-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.notification-title {
		font-weight: 500;
		font-size: var(--font-size-sm);
		color: var(--color-text-normal);
	}

	.notification-message {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}
</style>

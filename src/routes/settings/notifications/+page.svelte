<script lang="ts">
	import { toast } from '$lib/stores/toast';

	let saving = $state(false);

	interface NotificationSetting {
		id: string;
		label: string;
		description: string;
		email: boolean;
		inApp: boolean;
		icon: 'download' | 'comment' | 'star' | 'update' | 'announce';
	}

	let notifications = $state<NotificationSetting[]>([
		{
			id: 'downloads',
			label: 'Download milestones',
			description: 'Get notified when your modules reach download milestones (100, 1k, 10k, etc.)',
			email: true,
			inApp: true,
			icon: 'download'
		},
		{
			id: 'comments',
			label: 'New comments',
			description: 'When someone comments on your modules',
			email: true,
			inApp: true,
			icon: 'comment'
		},
		{
			id: 'stars',
			label: 'New stars',
			description: 'When someone stars your modules',
			email: false,
			inApp: true,
			icon: 'star'
		},
		{
			id: 'updates',
			label: 'Module updates',
			description: 'When modules you starred release new versions',
			email: true,
			inApp: true,
			icon: 'update'
		},
		{
			id: 'announcements',
			label: 'Platform announcements',
			description: 'Important updates about Waybar Marketplace',
			email: true,
			inApp: true,
			icon: 'announce'
		}
	]);

	async function saveNotifications() {
		saving = true;
		await new Promise((resolve) => setTimeout(resolve, 500));
		saving = false;
		toast.success('Notification preferences saved!');
	}
</script>

<svelte:head>
	<title>Notification Settings - Waybar Marketplace</title>
</svelte:head>

<div class="settings-header">
	<h2>Notifications</h2>
	<p class="settings-description">Manage how and when you receive notifications.</p>
</div>

<div class="notification-settings">
	<div class="toggle-header">
		<span class="toggle-header-label"></span>
		<div class="toggle-labels">
			<span class="toggle-label">
				<svg
					viewBox="0 0 24 24"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
					<polyline points="22,6 12,13 2,6" />
				</svg>
				Email
			</span>
			<span class="toggle-label">
				<svg
					viewBox="0 0 24 24"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
					<path d="M13.73 21a2 2 0 0 1-3.46 0" />
				</svg>
				In-app
			</span>
		</div>
	</div>

	{#each notifications as notification (notification.id)}
		<div class="notification-row">
			<div class="notification-info">
				<div class="notification-icon">
					{#if notification.icon === 'download'}
						<svg
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					{:else if notification.icon === 'comment'}
						<svg
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
							/>
						</svg>
					{:else if notification.icon === 'star'}
						<svg
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
							/>
						</svg>
					{:else if notification.icon === 'update'}
						<svg
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<polyline points="23 4 23 10 17 10" />
							<path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
						</svg>
					{:else if notification.icon === 'announce'}
						<svg
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"
							/>
						</svg>
					{/if}
				</div>
				<div class="notification-text">
					<span class="notification-label">{notification.label}</span>
					<span class="notification-description">{notification.description}</span>
				</div>
			</div>
			<div class="notification-toggles">
				<label class="toggle">
					<input type="checkbox" bind:checked={notification.email} />
					<span class="toggle-track">
						<span class="toggle-thumb"></span>
					</span>
					<span class="sr-only">Email notifications for {notification.label}</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={notification.inApp} />
					<span class="toggle-track">
						<span class="toggle-thumb"></span>
					</span>
					<span class="sr-only">In-app notifications for {notification.label}</span>
				</label>
			</div>
		</div>
	{/each}
</div>

<div class="form-actions">
	<button class="btn btn-primary" onclick={saveNotifications} disabled={saving}>
		{#if saving}
			<span class="spinner"></span>
			Saving...
		{:else}
			Save Preferences
		{/if}
	</button>
</div>

<style>
	.settings-header {
		margin-bottom: var(--space-lg);
	}

	.settings-header h2 {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-normal);
		margin: 0 0 var(--space-xs) 0;
	}

	.settings-description {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		margin: 0;
	}

	.notification-settings {
		margin-bottom: var(--space-lg);
	}

	.toggle-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-sm) var(--space-md);
		margin-bottom: var(--space-sm);
	}

	.toggle-header-label {
		flex: 1;
	}

	.toggle-labels {
		display: flex;
		gap: var(--space-xl);
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--font-size-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		width: 60px;
		justify-content: center;
	}

	.notification-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-sm);
	}

	.notification-info {
		display: flex;
		align-items: flex-start;
		gap: var(--space-md);
		flex: 1;
	}

	.notification-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.notification-text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.notification-label {
		font-weight: 500;
		color: var(--color-text-normal);
		font-size: var(--font-size-sm);
	}

	.notification-description {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	.notification-toggles {
		display: flex;
		gap: var(--space-xl);
	}

	.toggle {
		display: flex;
		align-items: center;
		cursor: pointer;
		width: 60px;
		justify-content: center;
	}

	.toggle input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.toggle-track {
		position: relative;
		width: 44px;
		height: 24px;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.toggle input:checked + .toggle-track {
		background-color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.toggle input:focus-visible + .toggle-track {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 30%, transparent);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 18px;
		height: 18px;
		background-color: white;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.toggle input:checked + .toggle-track .toggle-thumb {
		transform: translateX(20px);
	}

	.form-actions {
		display: flex;
		gap: var(--space-md);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		width: 14px;
		height: 14px;
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

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 640px) {
		.notification-row {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}

		.notification-toggles {
			width: 100%;
			justify-content: flex-end;
		}

		.toggle-header {
			display: none;
		}

		.toggle {
			flex-direction: column;
			gap: var(--space-2xs);
		}

		.toggle::before {
			content: attr(data-label);
			font-size: var(--font-size-xs);
			color: var(--color-text-muted);
		}
	}
</style>

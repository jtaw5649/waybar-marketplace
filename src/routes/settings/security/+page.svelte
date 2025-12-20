<script lang="ts">
	import type { PageData } from './$types';
	import Modal from '$lib/components/Modal.svelte';
	import { toast } from '$lib/stores/toast';
	import { signOut } from '@auth/sveltekit/client';

	let { data }: { data: PageData } = $props();

	let showDeleteModal = $state(false);
	let showExportModal = $state(false);
	let deleteConfirmation = $state('');
	let deleting = $state(false);
	let exporting = $state(false);

	let requiredConfirmation = $derived(data.session?.user?.login || 'delete');

	let canDelete = $derived(deleteConfirmation === requiredConfirmation);

	async function handleExportData() {
		exporting = true;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			toast.success('Your data export has been prepared. Check your email for the download link.');
			showExportModal = false;
		} catch {
			toast.error('Failed to export data. Please try again.');
		} finally {
			exporting = false;
		}
	}

	async function handleDeleteAccount() {
		if (!canDelete) return;

		deleting = true;
		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success('Account scheduled for deletion. You will be signed out.');
			showDeleteModal = false;
			await signOut({ redirectTo: '/' });
		} catch {
			toast.error('Failed to delete account. Please try again.');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Security Settings - Waybar Marketplace</title>
</svelte:head>

<div class="settings-header">
	<h2>Security</h2>
	<p class="settings-description">Manage your account security and connected services.</p>
</div>

<section class="settings-section">
	<h3 class="section-title">Connected Accounts</h3>
	<p class="section-description">Services connected to your Waybar Marketplace account.</p>

	<div class="connected-accounts">
		<div class="connected-account">
			<div class="account-info">
				<div class="account-icon github">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
				</div>
				<div class="account-details">
					<span class="account-name">GitHub</span>
					<span class="account-username">@{data.session?.user?.login || 'unknown'}</span>
				</div>
			</div>
			<div class="account-status">
				<span class="status-badge connected">
					<svg
						viewBox="0 0 24 24"
						width="14"
						height="14"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
					Connected
				</span>
			</div>
		</div>
	</div>

	<p class="connected-note">
		Your account is authenticated through GitHub. To change your primary email or username, update
		your GitHub profile settings.
	</p>
</section>

<section class="settings-section">
	<h3 class="section-title">Sessions</h3>
	<p class="section-description">Manage your active sessions.</p>

	<div class="session-info">
		<div class="session-current">
			<div class="session-details">
				<span class="session-label">Current Session</span>
				<span class="session-meta">Signed in via GitHub OAuth</span>
			</div>
			<button class="btn btn-secondary" onclick={() => signOut({ redirectTo: '/login' })}>
				Sign Out
			</button>
		</div>
	</div>
</section>

<section class="settings-section danger-zone">
	<h3 class="section-title danger">
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
				d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
			/>
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
		Danger Zone
	</h3>
	<p class="section-description">Irreversible and destructive actions.</p>

	<div class="danger-actions">
		<div class="danger-action">
			<div class="danger-action-info">
				<span class="danger-action-title">Export Your Data</span>
				<span class="danger-action-description">
					Download a copy of all your data including modules, collections, and profile information.
				</span>
			</div>
			<button class="btn btn-outline" onclick={() => (showExportModal = true)}>
				<svg
					viewBox="0 0 24 24"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				Export Data
			</button>
		</div>

		<div class="danger-action delete">
			<div class="danger-action-info">
				<span class="danger-action-title">Delete Account</span>
				<span class="danger-action-description">
					Permanently delete your account and all associated data. This action cannot be undone.
				</span>
			</div>
			<button class="btn btn-danger" onclick={() => (showDeleteModal = true)}>
				<svg
					viewBox="0 0 24 24"
					width="16"
					height="16"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<polyline points="3 6 5 6 21 6" />
					<path
						d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
					/>
					<line x1="10" y1="11" x2="10" y2="17" />
					<line x1="14" y1="11" x2="14" y2="17" />
				</svg>
				Delete Account
			</button>
		</div>
	</div>
</section>

{#if showExportModal}
	<Modal open={showExportModal} title="Export Your Data" onclose={() => (showExportModal = false)}>
		<div class="modal-content">
			<p>We'll prepare a download of your data, including:</p>
			<ul class="export-list">
				<li>Profile information</li>
				<li>Your modules and their metadata</li>
				<li>Collections</li>
				<li>Starred modules</li>
				<li>Comments and reviews</li>
			</ul>
			<p class="modal-note">
				You'll receive an email with a download link when your export is ready (usually within a few
				minutes).
			</p>
		</div>
		<div class="modal-actions">
			<button class="btn btn-secondary" onclick={() => (showExportModal = false)}>Cancel</button>
			<button class="btn btn-primary" onclick={handleExportData} disabled={exporting}>
				{#if exporting}
					<span class="spinner"></span>
					Preparing...
				{:else}
					Request Export
				{/if}
			</button>
		</div>
	</Modal>
{/if}

{#if showDeleteModal}
	<Modal open={showDeleteModal} title="Delete Account" onclose={() => (showDeleteModal = false)}>
		<div class="modal-content delete-content">
			<div class="delete-warning">
				<div class="warning-icon">
					<svg
						viewBox="0 0 24 24"
						width="28"
						height="28"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path
							d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
						/>
						<line x1="12" y1="9" x2="12" y2="13" />
						<line x1="12" y1="17" x2="12.01" y2="17" />
					</svg>
				</div>
				<div class="warning-text">
					<strong>This action is permanent and cannot be undone.</strong>
					<p>Deleting your account will:</p>
					<ul>
						<li>Remove your profile and all personal data</li>
						<li>Delete all your modules from the marketplace</li>
						<li>Remove your collections and stars</li>
						<li>Delete your comments and reviews</li>
					</ul>
				</div>
			</div>

			<div class="delete-confirmation">
				<label for="delete-confirm">
					Type <strong>{requiredConfirmation}</strong> to confirm:
				</label>
				<input
					type="text"
					id="delete-confirm"
					bind:value={deleteConfirmation}
					placeholder={requiredConfirmation}
					autocomplete="off"
				/>
			</div>
		</div>
		<div class="modal-actions">
			<button class="btn btn-secondary" onclick={() => (showDeleteModal = false)}>Cancel</button>
			<button
				class="btn btn-danger"
				onclick={handleDeleteAccount}
				disabled={!canDelete || deleting}
			>
				{#if deleting}
					<span class="spinner"></span>
					Deleting...
				{:else}
					Delete My Account
				{/if}
			</button>
		</div>
	</Modal>
{/if}

<style>
	.settings-header {
		margin-bottom: var(--space-xl);
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

	.settings-section {
		margin-bottom: var(--space-xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.settings-section:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.section-title {
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-text-normal);
		margin: 0 0 var(--space-xs) 0;
	}

	.section-title.danger {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-danger);
	}

	.section-description {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		margin: 0 0 var(--space-md) 0;
	}

	.connected-accounts {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.connected-account {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.account-info {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.account-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
	}

	.account-icon.github {
		background-color: #24292f;
		color: white;
	}

	.account-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.account-name {
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.account-username {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		font-size: var(--font-size-xs);
		font-weight: 500;
		border-radius: var(--radius-full);
	}

	.status-badge.connected {
		background-color: color-mix(in srgb, var(--color-success) 15%, transparent);
		color: var(--color-success);
	}

	.connected-note {
		margin-top: var(--space-md);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.session-info {
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.session-current {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.session-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.session-label {
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.session-meta {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.danger-zone {
		background-color: color-mix(in srgb, var(--color-danger) 5%, transparent);
		margin: 0 calc(-1 * var(--space-xl));
		padding: var(--space-xl);
		border-radius: var(--radius-lg);
		border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
	}

	.danger-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.danger-action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.danger-action.delete {
		border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
	}

	.danger-action-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.danger-action-title {
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.danger-action-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			opacity var(--duration-fast) var(--ease-out);
		white-space: nowrap;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background-color: var(--color-primary-dark);
	}

	.btn-secondary {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-bg-surface);
	}

	.btn-outline {
		background: none;
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-outline:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
	}

	.btn-danger {
		background-color: var(--color-danger);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: color-mix(in srgb, var(--color-danger) 85%, black);
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

	.modal-content {
		padding: var(--space-md) 0;
	}

	.modal-content p {
		margin: 0 0 var(--space-md) 0;
		color: var(--color-text-normal);
	}

	.export-list {
		margin: 0 0 var(--space-md) var(--space-lg);
		padding: 0;
		color: var(--color-text-muted);
	}

	.export-list li {
		margin-bottom: var(--space-xs);
	}

	.modal-note {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		padding: var(--space-sm);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-md);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
		padding-top: var(--space-md);
		border-top: 1px solid var(--color-border);
	}

	.delete-content {
		padding: 0;
	}

	.delete-warning {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
		background-color: color-mix(in srgb, var(--color-danger) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-lg);
	}

	.warning-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background-color: color-mix(in srgb, var(--color-danger) 15%, transparent);
		color: var(--color-danger);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.warning-text {
		flex: 1;
	}

	.warning-text strong {
		display: block;
		color: var(--color-danger);
		margin-bottom: var(--space-sm);
	}

	.warning-text p {
		margin: 0 0 var(--space-xs) 0;
		font-size: var(--font-size-sm);
	}

	.warning-text ul {
		margin: 0;
		padding-left: var(--space-lg);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.warning-text li {
		margin-bottom: var(--space-2xs);
	}

	.delete-confirmation {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.delete-confirmation label {
		font-size: var(--font-size-sm);
		color: var(--color-text-normal);
	}

	.delete-confirmation input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		color: var(--color-text-normal);
	}

	.delete-confirmation input:focus {
		outline: none;
		border-color: var(--color-danger);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 20%, transparent);
	}

	@media (max-width: 640px) {
		.connected-account,
		.session-current,
		.danger-action {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}

		.danger-zone {
			margin: 0 calc(-1 * var(--space-md));
			padding: var(--space-md);
		}

		.delete-warning {
			flex-direction: column;
		}

		.warning-icon {
			align-self: flex-start;
		}
	}
</style>

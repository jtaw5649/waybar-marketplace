<script lang="ts">
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { toast } from '$lib/stores/toast';

	let { data }: { data: PageData } = $props();

	interface Submission {
		id: number;
		submitter_id: number;
		uuid: string;
		name: string;
		description: string;
		category: string;
		version: string;
		repo_url: string;
		status: string;
		submitted_at: string;
		submitter_username: string;
	}

	let submissions: Submission[] = $state($state.snapshot(data.submissions || []));
	let stats = $derived(data.stats);
	let actionLoading: number | null = $state(null);
	let rejectReason = $state('');
	let showRejectModal: number | null = $state(null);

	async function approveSubmission(id: number) {
		actionLoading = id;
		try {
			const res = await fetch(`${API_BASE_URL}/api/v1/admin/submissions/${id}/approve`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${data.session?.accessToken}` },
				credentials: 'include'
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Failed to approve submission');
			}

			submissions = submissions.filter((s) => s.id !== id);
			toast.success('Submission approved successfully!');
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			toast.error(message);
		} finally {
			actionLoading = null;
		}
	}

	async function rejectSubmission(id: number) {
		if (!rejectReason.trim()) {
			toast.error('Please provide a rejection reason');
			return;
		}

		actionLoading = id;
		try {
			const res = await fetch(`${API_BASE_URL}/api/v1/admin/submissions/${id}/reject`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.session?.accessToken}`
				},
				body: JSON.stringify({ reason: rejectReason })
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Failed to reject submission');
			}

			submissions = submissions.filter((s) => s.id !== id);
			showRejectModal = null;
			rejectReason = '';
			toast.success('Submission rejected');
		} catch (e) {
			const message = e instanceof Error ? e.message : 'Unknown error';
			toast.error(message);
		} finally {
			actionLoading = null;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatNumber(n: number): string {
		if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return n.toString();
	}
</script>

<Header session={data.session} />

<main id="main-content">
	<div class="page-header">
		<div class="page-header-content">
			<h1>Admin Dashboard</h1>
			<p>Manage module submissions and platform statistics</p>
		</div>
	</div>
	<section class="content">
		{#if stats}
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon modules">
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<line x1="3" y1="9" x2="21" y2="9" />
							<line x1="9" y1="21" x2="9" y2="9" />
						</svg>
					</div>
					<span class="stat-value">{formatNumber(stats.total_modules)}</span>
					<span class="stat-label">Total Modules</span>
				</div>
				<div class="stat-card">
					<div class="stat-icon users">
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
							<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
							<path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					</div>
					<span class="stat-value">{formatNumber(stats.total_users)}</span>
					<span class="stat-label">Total Users</span>
				</div>
				<div class="stat-card">
					<div class="stat-icon downloads">
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
					</div>
					<span class="stat-value">{formatNumber(stats.total_downloads)}</span>
					<span class="stat-label">Total Downloads</span>
				</div>
				<div class="stat-card pending">
					<div class="stat-icon pending-icon">
						<svg
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
					</div>
					<span class="stat-value">{stats.pending_submissions}</span>
					<span class="stat-label">Pending Submissions</span>
				</div>
			</div>
		{/if}

		<div class="submissions-section">
			<h2>Pending Submissions</h2>

			{#if submissions.length === 0}
				<div class="empty-state">
					<svg
						viewBox="0 0 24 24"
						width="48"
						height="48"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<polyline points="9,11 12,14 22,4" />
						<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
					</svg>
					<p>No pending submissions</p>
				</div>
			{:else}
				<div class="submissions-list">
					{#each submissions as submission (submission.id)}
						<div class="submission-card">
							<div class="submission-header">
								<h3>{submission.name}</h3>
								<Badge variant="outline" size="sm">{submission.category}</Badge>
							</div>
							<p class="uuid">{submission.uuid}</p>
							<p class="description">{submission.description}</p>
							<div class="submission-meta">
								<span class="meta-item">
									<svg
										viewBox="0 0 24 24"
										width="14"
										height="14"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
										<circle cx="12" cy="7" r="4" />
									</svg>
									{submission.submitter_username}
								</span>
								<span class="meta-item">
									<svg
										viewBox="0 0 24 24"
										width="14"
										height="14"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
										/>
										<line x1="7" y1="7" x2="7.01" y2="7" />
									</svg>
									v{submission.version}
								</span>
								<span class="meta-item">
									<svg
										viewBox="0 0 24 24"
										width="14"
										height="14"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
										<line x1="16" y1="2" x2="16" y2="6" />
										<line x1="8" y1="2" x2="8" y2="6" />
										<line x1="3" y1="10" x2="21" y2="10" />
									</svg>
									{formatDate(submission.submitted_at)}
								</span>
							</div>
							<div class="submission-actions">
								<a
									href={submission.repo_url}
									target="_blank"
									rel="noopener"
									class="btn btn-secondary"
								>
									<svg
										viewBox="0 0 24 24"
										width="16"
										height="16"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
										<polyline points="15 3 21 3 21 9" />
										<line x1="10" y1="14" x2="21" y2="3" />
									</svg>
									View Repo
								</a>
								<button
									class="btn btn-success"
									disabled={actionLoading === submission.id}
									onclick={() => approveSubmission(submission.id)}
								>
									{#if actionLoading === submission.id}
										<span class="spinner"></span>
									{:else}
										<svg
											viewBox="0 0 24 24"
											width="16"
											height="16"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<polyline points="20 6 9 17 4 12" />
										</svg>
									{/if}
									Approve
								</button>
								<button
									class="btn btn-danger"
									disabled={actionLoading === submission.id}
									onclick={() => (showRejectModal = submission.id)}
								>
									<svg
										viewBox="0 0 24 24"
										width="16"
										height="16"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
									Reject
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<Modal
		open={showRejectModal !== null}
		title="Reject Submission"
		size="sm"
		onclose={() => (showRejectModal = null)}
	>
		<p class="modal-text">Please provide a reason for rejecting this submission:</p>
		<textarea
			bind:value={rejectReason}
			placeholder="Rejection reason..."
			rows="3"
			class="reject-textarea"
		></textarea>
		{#snippet footer()}
			<div class="modal-actions">
				<button class="btn btn-secondary" onclick={() => (showRejectModal = null)}> Cancel </button>
				<button
					class="btn btn-danger"
					disabled={actionLoading !== null}
					onclick={() => rejectSubmission(showRejectModal!)}
				>
					{#if actionLoading !== null}
						<span class="spinner"></span>
					{/if}
					Reject
				</button>
			</div>
		{/snippet}
	</Modal>
</main>

<Footer />

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.page-header {
		padding: var(--space-xl) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-surface);
	}

	.page-header-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.page-header p {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.content {
		padding: var(--space-2xl);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-lg);
		margin-bottom: var(--space-2xl);
	}

	.stat-card {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
	}

	.stat-card.pending {
		border-color: var(--color-primary);
		background: linear-gradient(135deg, rgba(97, 125, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
	}

	.stat-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		margin-bottom: var(--space-md);
	}

	.stat-icon.modules {
		background-color: rgba(97, 125, 250, 0.1);
		color: var(--color-primary);
	}

	.stat-icon.users {
		background-color: rgba(16, 185, 129, 0.1);
		color: #10b981;
	}

	.stat-icon.downloads {
		background-color: rgba(245, 158, 11, 0.1);
		color: #f59e0b;
	}

	.stat-icon.pending-icon {
		background-color: rgba(139, 92, 246, 0.1);
		color: #8b5cf6;
	}

	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: var(--color-text-normal);
	}

	.stat-label {
		display: block;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-top: var(--space-xs);
	}

	.submissions-section h2 {
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
		color: #10b981;
		opacity: 0.6;
	}

	.submissions-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.submission-card {
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	.submission-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xs);
	}

	.submission-header h3 {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.uuid {
		font-size: 0.75rem;
		color: var(--color-text-faint);
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		margin-bottom: var(--space-md);
	}

	.description {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
		line-height: 1.5;
	}

	.submission-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
		font-size: 0.75rem;
		color: var(--color-text-faint);
		margin-bottom: var(--space-lg);
	}

	.meta-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.submission-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 0.875rem;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-secondary {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--color-bg-base);
	}

	.btn-success {
		background-color: #22c55e;
		color: white;
	}

	.btn-success:hover:not(:disabled) {
		background-color: #16a34a;
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background-color: #dc2626;
	}

	.modal-text {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-bottom: var(--space-md);
	}

	.reject-textarea {
		width: 100%;
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		color: var(--color-text-normal);
		font-size: 0.875rem;
		resize: vertical;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.reject-textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(97, 125, 250, 0.15);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-md);
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

	@media (max-width: 768px) {
		.page-header {
			padding: var(--space-lg);
		}

		.content {
			padding: var(--space-lg);
		}

		.submission-actions {
			flex-direction: column;
		}

		.submission-actions .btn {
			width: 100%;
		}
	}
</style>

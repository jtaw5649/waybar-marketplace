<script lang="ts">
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface ReviewUser {
		username: string;
		avatar_url: string | null;
	}

	interface Review {
		id: number;
		rating: number;
		title: string | null;
		body: string | null;
		helpful_count: number;
		created_at: string;
		updated_at: string | null;
		user: ReviewUser;
	}

	interface Module {
		uuid: string;
		name: string;
		author: string;
		description: string;
		category: string;
		version: string;
		downloads: number;
		rating: number | null;
		repo_url: string;
		verified_author: boolean;
	}

	let module: Module | null = $state(null);
	let reviews: Review[] = $state([]);
	let loading = $state(true);
	let error: string | null = $state(null);

	let showReviewForm = $state(false);
	let userReview: Review | null = $state(null);
	let reviewRating = $state(5);
	let reviewTitle = $state('');
	let reviewBody = $state('');
	let reviewLoading = $state(false);
	let reviewError: string | null = $state(null);

	$effect(() => {
		fetchModuleAndReviews();
	});

	async function fetchModuleAndReviews() {
		try {
			const [moduleRes, reviewsRes] = await Promise.all([
				fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(data.uuid)}`),
				fetch(`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(data.uuid)}/reviews`)
			]);

			if (!moduleRes.ok) throw new Error('Module not found');

			const moduleData = await moduleRes.json();
			module = moduleData.data || moduleData;

			const reviewsData = await reviewsRes.json();
			reviews = reviewsData.data?.reviews || reviewsData.reviews || [];

			if (data.session?.user) {
				const username = data.session.user.name;
				userReview = reviews.find((r) => r.user.username === username) || null;
				if (userReview) {
					reviewRating = userReview.rating;
					reviewTitle = userReview.title || '';
					reviewBody = userReview.body || '';
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	async function submitReview() {
		reviewLoading = true;
		reviewError = null;

		try {
			const method = userReview ? 'PUT' : 'POST';
			const res = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(data.uuid)}/reviews`,
				{
					method,
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						rating: reviewRating,
						title: reviewTitle || null,
						body: reviewBody || null
					})
				}
			);

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Failed to submit review');
			}

			showReviewForm = false;
			await fetchModuleAndReviews();
		} catch (e) {
			reviewError = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			reviewLoading = false;
		}
	}

	async function deleteReview() {
		if (!confirm('Are you sure you want to delete your review?')) return;

		reviewLoading = true;
		try {
			const res = await fetch(
				`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(data.uuid)}/reviews`,
				{
					method: 'DELETE',
					credentials: 'include'
				}
			);

			if (!res.ok) throw new Error('Failed to delete review');

			userReview = null;
			reviewRating = 5;
			reviewTitle = '';
			reviewBody = '';
			await fetchModuleAndReviews();
		} catch (e) {
			reviewError = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			reviewLoading = false;
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function renderStars(rating: number): string {
		return '★'.repeat(rating) + '☆'.repeat(5 - rating);
	}
</script>

<main>
	{#if loading}
		<div class="loading">Loading module...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else if module}
		<header>
			<div class="header-content">
				<div class="breadcrumb">
					<a href="/browse">Browse</a> / {module.name}
				</div>
				<h1>{module.name}</h1>
				<p class="author">
					by {module.author}
					{#if module.verified_author}
						<span class="verified" title="Verified Author">✓</span>
					{/if}
				</p>
			</div>
		</header>

		<section class="content">
			<div class="module-info">
				<p class="description">{module.description}</p>

				<div class="meta">
					<span class="category">{module.category}</span>
					<span class="version">v{module.version}</span>
					<span class="downloads">{module.downloads.toLocaleString()} downloads</span>
					{#if module.rating}
						<span class="rating">{renderStars(Math.round(module.rating))}</span>
					{/if}
				</div>

				<a href={module.repo_url} target="_blank" rel="noopener" class="btn btn-secondary">
					View Repository
				</a>
			</div>

			<div class="reviews-section">
				<div class="reviews-header">
					<h2>Reviews ({reviews.length})</h2>
					{#if data.session?.user && !showReviewForm}
						<button class="btn btn-primary" onclick={() => (showReviewForm = true)}>
							{userReview ? 'Edit Review' : 'Write Review'}
						</button>
					{/if}
				</div>

				{#if showReviewForm}
					<form class="review-form" onsubmit={(e) => { e.preventDefault(); submitReview(); }}>
						{#if reviewError}
							<div class="form-error">{reviewError}</div>
						{/if}

						<div class="form-group">
							<label>Rating</label>
							<div class="star-input">
								{#each [1, 2, 3, 4, 5] as star}
									<button
										type="button"
										class="star-btn"
										class:active={star <= reviewRating}
										onclick={() => (reviewRating = star)}
									>
										{star <= reviewRating ? '★' : '☆'}
									</button>
								{/each}
							</div>
						</div>

						<div class="form-group">
							<label for="review-title">Title (optional)</label>
							<input
								type="text"
								id="review-title"
								bind:value={reviewTitle}
								placeholder="Summary of your review"
								maxlength="100"
							/>
						</div>

						<div class="form-group">
							<label for="review-body">Review (optional)</label>
							<textarea
								id="review-body"
								bind:value={reviewBody}
								placeholder="Share your experience with this module..."
								rows="4"
							></textarea>
						</div>

						<div class="form-actions">
							<button type="submit" class="btn btn-primary" disabled={reviewLoading}>
								{reviewLoading ? 'Saving...' : userReview ? 'Update Review' : 'Submit Review'}
							</button>
							<button
								type="button"
								class="btn btn-secondary"
								onclick={() => (showReviewForm = false)}
							>
								Cancel
							</button>
							{#if userReview}
								<button
									type="button"
									class="btn btn-danger"
									onclick={deleteReview}
									disabled={reviewLoading}
								>
									Delete
								</button>
							{/if}
						</div>
					</form>
				{/if}

				{#if reviews.length === 0}
					<p class="no-reviews">No reviews yet. Be the first to review!</p>
				{:else}
					<div class="reviews-list">
						{#each reviews as review}
							<div class="review-card">
								<div class="review-header">
									<span class="review-stars">{renderStars(review.rating)}</span>
									<span class="review-author">{review.user.username}</span>
									<span class="review-date">{formatDate(review.created_at)}</span>
								</div>
								{#if review.title}
									<h3 class="review-title">{review.title}</h3>
								{/if}
								{#if review.body}
									<p class="review-body">{review.body}</p>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	{/if}
</main>

<style>
	main {
		min-height: 100vh;
	}

	.loading,
	.error {
		padding: var(--space-2xl);
		text-align: center;
	}

	.error {
		color: var(--color-error);
	}

	header {
		padding: var(--space-xl) var(--space-2xl);
		border-bottom: 1px solid var(--color-border);
	}

	.breadcrumb {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: var(--space-sm);
	}

	.breadcrumb a {
		color: var(--color-primary);
	}

	header h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: var(--space-xs);
	}

	.author {
		color: var(--color-text-muted);
	}

	.verified {
		color: var(--color-primary);
		margin-left: var(--space-xs);
	}

	.content {
		padding: var(--space-2xl);
		max-width: 900px;
		margin: 0 auto;
	}

	.module-info {
		margin-bottom: var(--space-2xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.description {
		font-size: 1.125rem;
		line-height: 1.6;
		margin-bottom: var(--space-lg);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		font-size: 0.875rem;
	}

	.category {
		background-color: var(--color-bg-elevated);
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.rating {
		color: #fbbf24;
	}

	.reviews-section {
		margin-top: var(--space-xl);
	}

	.reviews-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.reviews-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.review-form {
		background-color: var(--color-bg-surface);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		margin-bottom: var(--space-xl);
	}

	.form-group {
		margin-bottom: var(--space-md);
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: var(--space-xs);
	}

	.star-input {
		display: flex;
		gap: var(--space-xs);
	}

	.star-btn {
		font-size: 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: 0;
	}

	.star-btn.active {
		color: #fbbf24;
	}

	input,
	textarea {
		width: 100%;
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		color: var(--color-text-normal);
		font-size: 0.875rem;
	}

	.form-actions {
		display: flex;
		gap: var(--space-md);
	}

	.form-error {
		padding: var(--space-md);
		background-color: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		margin-bottom: var(--space-md);
	}

	.no-reviews {
		color: var(--color-text-muted);
		text-align: center;
		padding: var(--space-xl);
	}

	.reviews-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.review-card {
		background-color: var(--color-bg-surface);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.review-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-sm);
		font-size: 0.875rem;
	}

	.review-stars {
		color: #fbbf24;
	}

	.review-author {
		font-weight: 500;
	}

	.review-date {
		color: var(--color-text-faint);
	}

	.review-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--space-sm);
	}

	.review-body {
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.btn {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 0.875rem;
		border: none;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-secondary {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}
</style>

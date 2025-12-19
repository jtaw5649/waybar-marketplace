<script lang="ts">
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Tag from '$lib/components/Tag.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import { toast } from '$lib/stores/toast';

	const categoryVariants: Record<
		string,
		'purple' | 'blue' | 'green' | 'amber' | 'pink' | 'teal' | 'gray'
	> = {
		system: 'purple',
		hardware: 'green',
		network: 'blue',
		audio: 'pink',
		media: 'amber',
		productivity: 'teal',
		weather: 'blue',
		utility: 'gray',
		notification: 'amber',
		workspace: 'purple',
		custom: 'pink',
		theme: 'teal',
		integration: 'green',
		clock: 'blue'
	};

	marked.setOptions({
		gfm: true,
		breaks: true
	});

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

	const REVIEWS_PER_PAGE = 10;
	let reviewPage = $state(1);

	const totalReviewPages = $derived(Math.ceil(reviews.length / REVIEWS_PER_PAGE));
	const paginatedReviews = $derived(
		reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
	);

	const categoryVariant = $derived.by(() => {
		if (!module) return 'gray';
		return categoryVariants[module.category.toLowerCase()] || 'gray';
	});

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
			toast.success(userReview ? 'Review updated successfully' : 'Review submitted successfully');
			await fetchModuleAndReviews();
		} catch (e) {
			reviewError = e instanceof Error ? e.message : 'Unknown error';
			toast.error('Failed to submit review');
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
			showReviewForm = false;
			toast.success('Review deleted');
			await fetchModuleAndReviews();
		} catch (e) {
			reviewError = e instanceof Error ? e.message : 'Unknown error';
			toast.error('Failed to delete review');
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

	function formatDownloads(n: number): string {
		if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return n.toString();
	}
</script>

<Header session={data.session} />

<main id="main-content">
	{#if loading}
		<div class="loading-state">
			<div class="loading-header">
				<Skeleton variant="text" width="100px" height="1rem" />
				<Skeleton variant="text" width="300px" height="2rem" />
				<Skeleton variant="text" width="150px" height="1rem" />
			</div>
			<div class="loading-content">
				<Skeleton variant="card" width="100%" height="200px" />
				<Skeleton variant="text" width="100%" height="1rem" />
				<Skeleton variant="text" width="80%" height="1rem" />
			</div>
		</div>
	{:else if error}
		<div class="error-state">
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
			<h2>Module not found</h2>
			<p>{error}</p>
			<a href="/browse" class="btn btn-primary">Back to Browse</a>
		</div>
	{:else if module}
		<div class="module-header">
			<div class="module-header-content">
				<div class="breadcrumb">
					<a href="/browse">Browse</a>
					<span>/</span>
					<a href="/browse?category={module.category}">{module.category}</a>
					<span>/</span>
					<span>{module.name}</span>
				</div>

				<div class="module-title-row">
					<div class="module-icon">
						{module.name.charAt(0).toUpperCase()}
					</div>
					<div class="module-title-info">
						<h1>{module.name}</h1>
						<p class="author">
							by <a href="/users/{module.author}">{module.author}</a>
							{#if module.verified_author}
								<Badge variant="success" size="sm" dot>Verified</Badge>
							{/if}
						</p>
					</div>
				</div>

				<div class="module-meta">
					<Tag variant={categoryVariant}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<line x1="3" y1="9" x2="21" y2="9" />
							<line x1="9" y1="21" x2="9" y2="9" />
						</svg>
						{module.category}
					</Tag>
					<Badge variant="version">v{module.version}</Badge>
					<span class="downloads-stat">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						{formatDownloads(module.downloads)}
					</span>
					{#if module.rating}
						<span class="meta-item">
							<StarRating value={module.rating} readonly size="sm" />
							<span class="rating-value">{module.rating.toFixed(1)}</span>
						</span>
					{/if}
				</div>

				<div class="module-actions">
					<div class="download-command">
						<code>waybar-mod install {module.uuid}</code>
						<CopyButton text={`waybar-mod install ${module.uuid}`} />
					</div>
					<a href={module.repo_url} target="_blank" rel="noopener" class="btn btn-secondary">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
						View Repository
					</a>
				</div>
			</div>
		</div>

		<div class="content">
			<div class="module-description">
				<h2>About</h2>
				<div class="description markdown-body">
					{@html marked.parse(module.description)}
				</div>
			</div>

			<div class="reviews-section">
				<div class="reviews-header">
					<h2>Reviews ({reviews.length})</h2>
					{#if data.session?.user && !showReviewForm}
						<button class="btn btn-primary" onclick={() => (showReviewForm = true)}>
							{userReview ? 'Edit Review' : 'Write Review'}
						</button>
					{:else if !data.session?.user}
						<a href="/login" class="btn btn-secondary">Sign in to Review</a>
					{/if}
				</div>

				{#if showReviewForm}
					<form
						class="review-form"
						onsubmit={(e) => {
							e.preventDefault();
							submitReview();
						}}
					>
						{#if reviewError}
							<div class="form-error">{reviewError}</div>
						{/if}

						<div class="form-group">
							<label for="rating-input">Rating</label>
							<StarRating value={reviewRating} onchange={(v) => (reviewRating = v)} size="lg" />
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
					<div class="no-reviews">
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
						<p>No reviews yet. Be the first to review!</p>
					</div>
				{:else}
					<div class="reviews-list">
						{#each paginatedReviews as review (review.id)}
							<div class="review-card">
								<div class="review-header">
									<div class="review-user">
										{#if review.user.avatar_url}
											<img src={review.user.avatar_url} alt="" class="review-avatar" />
										{:else}
											<div class="review-avatar-placeholder">
												{review.user.username.charAt(0).toUpperCase()}
											</div>
										{/if}
										<span class="review-author">{review.user.username}</span>
									</div>
									<div class="review-meta">
										<StarRating value={review.rating} readonly size="sm" />
										<span class="review-date">{formatDate(review.created_at)}</span>
									</div>
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

					{#if totalReviewPages > 1}
						<nav class="review-pagination" aria-label="Reviews pagination">
							<button
								class="pagination-btn"
								disabled={reviewPage === 1}
								onclick={() => (reviewPage = reviewPage - 1)}
								aria-label="Previous reviews"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<polyline points="15 18 9 12 15 6" />
								</svg>
								Previous
							</button>
							<span class="pagination-info">
								Page {reviewPage} of {totalReviewPages}
							</span>
							<button
								class="pagination-btn"
								disabled={reviewPage === totalReviewPages}
								onclick={() => (reviewPage = reviewPage + 1)}
								aria-label="Next reviews"
							>
								Next
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<polyline points="9 18 15 12 9 6" />
								</svg>
							</button>
						</nav>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</main>

<Footer />

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.loading-state,
	.error-state {
		padding: var(--space-3xl);
		text-align: center;
		max-width: 600px;
		margin: 0 auto;
	}

	.loading-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		margin-bottom: var(--space-2xl);
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		color: var(--color-text-muted);
	}

	.error-state svg {
		opacity: 0.5;
	}

	.error-state h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-normal);
	}

	.module-header {
		background-color: var(--color-bg-surface);
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-xl) var(--space-2xl);
	}

	.module-header-content {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 var(--space-2xl);
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: 0.875rem;
		color: var(--color-text-faint);
		margin-bottom: var(--space-lg);
	}

	.breadcrumb a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--color-primary);
	}

	.module-title-row {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.module-icon {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-lg);
		background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.75rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.module-title-info h1 {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: var(--space-xs);
	}

	.author {
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.author a {
		color: var(--color-text-normal);
		text-decoration: none;
	}

	.author a:hover {
		color: var(--color-primary);
	}

	.module-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.downloads-stat {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: #fbbf24;
		background: linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(245, 158, 11, 0.15));
		padding: 4px 10px;
		border-radius: 9999px;
	}

	.downloads-stat svg {
		color: #fb923c;
	}

	.rating-value {
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.module-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		align-items: center;
	}

	.download-command {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		background-color: var(--color-bg-elevated);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.875rem;
	}

	.download-command code {
		color: var(--color-text-normal);
	}

	.content {
		max-width: 900px;
		margin: 0 auto;
		padding: var(--space-2xl);
		width: 100%;
	}

	.module-description {
		margin-bottom: var(--space-2xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.module-description h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--space-lg);
	}

	.description {
		font-size: 1rem;
		line-height: 1.7;
	}

	.description :global(h1),
	.description :global(h2),
	.description :global(h3) {
		font-weight: 600;
		margin-top: var(--space-lg);
		margin-bottom: var(--space-md);
	}

	.description :global(h1) {
		font-size: 1.5rem;
	}
	.description :global(h2) {
		font-size: 1.25rem;
	}
	.description :global(h3) {
		font-size: 1.125rem;
	}

	.description :global(p) {
		margin-bottom: var(--space-md);
	}

	.description :global(code) {
		background-color: var(--color-bg-elevated);
		padding: 0.2em 0.4em;
		border-radius: var(--radius-sm);
		font-size: 0.875em;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
	}

	.description :global(pre) {
		background-color: var(--color-bg-elevated);
		padding: var(--space-md);
		border-radius: var(--radius-md);
		overflow-x: auto;
		margin-bottom: var(--space-md);
	}

	.description :global(pre code) {
		background: none;
		padding: 0;
	}

	.description :global(ul),
	.description :global(ol) {
		padding-left: var(--space-xl);
		margin-bottom: var(--space-md);
	}

	.description :global(li) {
		margin-bottom: var(--space-xs);
	}

	.description :global(blockquote) {
		border-left: 3px solid var(--color-border);
		padding-left: var(--space-md);
		margin-left: 0;
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.description :global(a) {
		color: var(--color-primary);
	}
	.description :global(img) {
		max-width: 100%;
		border-radius: var(--radius-md);
	}

	.reviews-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.reviews-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.review-form {
		background-color: var(--color-bg-surface);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		margin-bottom: var(--space-xl);
	}

	.form-group {
		margin-bottom: var(--space-lg);
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: var(--space-sm);
	}

	input,
	textarea {
		width: 100%;
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		color: var(--color-text-normal);
		font-size: 0.9rem;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--focus-ring);
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
		font-size: 0.875rem;
	}

	.no-reviews {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-2xl);
		text-align: center;
		color: var(--color-text-muted);
	}

	.no-reviews svg {
		opacity: 0.3;
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
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.review-user {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.review-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}

	.review-avatar-placeholder {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.review-author {
		font-weight: 500;
	}

	.review-meta {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.review-date {
		color: var(--color-text-faint);
		font-size: 0.8rem;
	}

	.review-title {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--space-sm);
	}

	.review-body {
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.review-pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		margin-top: var(--space-xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-border);
	}

	.review-pagination .pagination-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.review-pagination .pagination-btn:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.review-pagination .pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pagination-info {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: 0.875rem;
		border: none;
		cursor: pointer;
		text-decoration: none;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background-color: #5068d9;
	}

	.btn-secondary {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background-color: var(--color-bg-surface);
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}

	@media (max-width: 768px) {
		.module-header {
			padding: var(--space-lg);
		}

		.module-title-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.module-icon {
			width: 48px;
			height: 48px;
			font-size: 1.25rem;
		}

		.module-title-info h1 {
			font-size: 1.5rem;
		}

		.module-actions {
			flex-direction: column;
			width: 100%;
		}

		.download-command {
			width: 100%;
			justify-content: space-between;
		}

		.btn-secondary {
			width: 100%;
			justify-content: center;
		}

		.content {
			padding: var(--space-lg);
		}

		.review-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}
	}
</style>

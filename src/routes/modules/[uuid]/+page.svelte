<script lang="ts">
	import { enhance } from '$app/forms';
	import { API_BASE_URL } from '$lib';
	import type { PageData } from './$types';
	import { renderMarkdown } from '$lib/utils/markdown';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Tag from '$lib/components/Tag.svelte';
	import StarRating from '$lib/components/StarRating.svelte';
	import CopyButton from '$lib/components/CopyButton.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ModuleCard from '$lib/components/ModuleCard.svelte';
	import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';
	import BentoScreenshots from '$lib/components/BentoScreenshots.svelte';
	import { toast } from '$lib/stores/toast';
	import { recentlyViewed } from '$lib/stores/recentlyViewed';
	import { formatDownloads } from '$lib/utils/formatDownloads';

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

	let { data }: { data: PageData } = $props();

	let reviews = $derived(data.reviews);

	let showReviewForm = $state(false);
	let userReview = $derived.by(() => {
		if (!data.session?.user) return null;
		const username = data.session.user.name;
		return reviews.find((r) => r.user.username === username) || null;
	});
	let reviewRating = $state(5);
	let reviewTitle = $state('');
	let reviewBody = $state('');
	let reviewLoading = $state(false);
	let reviewError: string | null = $state(null);

	let collections = $derived(data.collections || []);
	let relatedModules = $derived(data.relatedModules || []);
	let showAddToCollectionModal = $state(false);
	let selectedCollectionId = $state('');
	let collectionNote = $state('');
	let addingToCollection = $state(false);

	let screenshots = $derived(data.screenshots || []);
	let isOwner = $derived(data.isOwner || false);
	let showUploadModal = $state(false);
	let uploadingScreenshot = $state(false);
	let selectedFile: File | null = $state(null);
	let altTextInput = $state('');
	let showStickyInstall = $state(false);
	let moduleActionsRef: HTMLElement | null = $state(null);

	const API_SCREENSHOT_BASE = $derived(`${API_BASE_URL}/screenshots/${data.uuid}`);

	$effect(() => {
		if (typeof window === 'undefined' || !moduleActionsRef) return;

		const observer = new IntersectionObserver(
			(entries) => {
				showStickyInstall = !entries[0].isIntersecting;
			},
			{ threshold: 0, rootMargin: '-80px 0px 0px 0px' }
		);

		observer.observe(moduleActionsRef);
		return () => observer.disconnect();
	});

	$effect(() => {
		recentlyViewed.add({
			uuid: data.uuid,
			name: data.module.name,
			author: data.module.author,
			description: data.module.description,
			category: data.module.category,
			downloads: data.module.downloads,
			verified_author: data.module.verified_author,
			version: data.module.version
		});
	});

	const REVIEWS_PER_PAGE = 10;
	let reviewPage = $state(1);

	const totalReviewPages = $derived(Math.ceil(reviews.length / REVIEWS_PER_PAGE));
	const paginatedReviews = $derived(
		reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE)
	);

	const categoryVariant = $derived(categoryVariants[data.module.category.toLowerCase()] || 'gray');

	$effect(() => {
		if (userReview) {
			reviewRating = userReview.rating;
			reviewTitle = userReview.title || '';
			reviewBody = userReview.body || '';
		}
	});

	async function fetchReviews() {
		const res = await fetch(
			`${API_BASE_URL}/api/v1/modules/${encodeURIComponent(data.uuid)}/reviews`
		);
		if (res.ok) {
			const reviewsData = await res.json();
			reviews = reviewsData.data?.reviews || reviewsData.reviews || [];
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
			await fetchReviews();
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

			reviewRating = 5;
			reviewTitle = '';
			reviewBody = '';
			showReviewForm = false;
			toast.success('Review deleted');
			await fetchReviews();
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

	let showAllVersions = $state(false);
	const INITIAL_VERSIONS_COUNT = 3;
	const displayedVersions = $derived(
		showAllVersions ? data.versions : data.versions.slice(0, INITIAL_VERSIONS_COUNT)
	);

	function getScreenshotUrl(r2Key: string): string {
		const filename = r2Key.split('/').pop() || r2Key;
		return `${API_SCREENSHOT_BASE}/${filename}`;
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			selectedFile = input.files[0];
		}
	}

	function resetUploadForm() {
		selectedFile = null;
		altTextInput = '';
		showUploadModal = false;
	}

	async function handleDeleteScreenshot(screenshotId: number) {
		const formData = new FormData();
		formData.append('screenshot_id', screenshotId.toString());

		const res = await fetch('?/deleteScreenshot', {
			method: 'POST',
			body: formData
		});

		if (res.ok) {
			screenshots = screenshots.filter((s) => s.id !== screenshotId);
			toast.success('Screenshot deleted');
		} else {
			toast.error('Failed to delete screenshot');
		}
	}
</script>

<Header session={data.session} />

{#if showStickyInstall}
	<div class="sticky-install-bar">
		<div class="sticky-install-content">
			<span class="sticky-module-name">{data.module.name}</span>
			<div class="sticky-command">
				<code>waybar-mod install {data.module.uuid}</code>
				<CopyButton text={`waybar-mod install ${data.module.uuid}`} />
			</div>
		</div>
	</div>
{/if}

<main id="main-content">
	<div class="module-header">
		<div class="module-header-content">
			<div class="breadcrumb">
				<a href="/browse">Browse</a>
				<span>/</span>
				<a href="/browse?category={data.module.category}">{data.module.category}</a>
				<span>/</span>
				<span>{data.module.name}</span>
			</div>

			<div class="module-title-row">
				<div class="module-icon">
					{data.module.name.charAt(0).toUpperCase()}
				</div>
				<div class="module-title-info">
					<h1>{data.module.name}</h1>
					<p class="author">
						by <a href="/users/{data.module.author}">{data.module.author}</a>
						{#if data.module.verified_author}
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
					{data.module.category}
				</Tag>
				<Badge variant="version">v{data.module.version}</Badge>
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
					{formatDownloads(data.module.downloads)}
				</span>
				{#if data.module.rating}
					<span class="meta-item">
						<StarRating value={data.module.rating} readonly size="sm" />
						<span class="rating-value">{data.module.rating.toFixed(1)}</span>
					</span>
				{/if}
			</div>

			<div class="module-actions" bind:this={moduleActionsRef}>
				<div class="download-command">
					<code>waybar-mod install {data.module.uuid}</code>
					<CopyButton text={`waybar-mod install ${data.module.uuid}`} />
				</div>
				<a href={data.module.repo_url} target="_blank" rel="noopener" class="btn btn-secondary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					View Repository
				</a>
				{#if data.session?.user && collections.length > 0}
					<button class="btn btn-secondary" onclick={() => (showAddToCollectionModal = true)}>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
							/>
							<line x1="12" y1="11" x2="12" y2="17" />
							<line x1="9" y1="14" x2="15" y2="14" />
						</svg>
						Add to Collection
					</button>
				{/if}
			</div>
		</div>
	</div>

	<div class="content">
		<div class="module-description">
			<h2>About</h2>
			<div class="description markdown-body">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html renderMarkdown(data.module.description)}
			</div>
		</div>

		{#if screenshots.length > 0 || isOwner}
			<div class="screenshots-section">
				<div class="screenshots-header">
					<h2>Screenshots ({screenshots.length})</h2>
					{#if isOwner && screenshots.length < 5}
						<button class="btn btn-secondary" onclick={() => (showUploadModal = true)}>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<line x1="12" y1="8" x2="12" y2="16" />
								<line x1="8" y1="12" x2="16" y2="12" />
							</svg>
							Add Screenshot
						</button>
					{/if}
				</div>

				{#if screenshots.length === 0}
					<div class="no-screenshots">
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<path d="m21 15-5-5L5 21" />
						</svg>
						<p>No screenshots yet</p>
						{#if isOwner}
							<p class="hint">Upload screenshots to show off your module</p>
						{/if}
					</div>
				{:else}
					<BentoScreenshots
						{screenshots}
						getUrl={getScreenshotUrl}
						{isOwner}
						onDelete={handleDeleteScreenshot}
					/>
				{/if}
			</div>
		{/if}

		{#if data.versions.length > 0}
			<CollapsibleSection title="Version History" count={data.versions.length}>
				<div class="versions-list">
					{#each displayedVersions as version (version.version)}
						<div class="version-card">
							<div class="version-header">
								<div class="version-info">
									<Badge variant="version">v{version.version}</Badge>
									<span class="version-date">{formatDate(version.published_at)}</span>
								</div>
								<span class="version-downloads">
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
									{formatDownloads(version.downloads)}
								</span>
							</div>
							{#if version.changelog}
								<div class="version-changelog">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html renderMarkdown(version.changelog)}
								</div>
							{:else}
								<p class="no-changelog">No changelog provided</p>
							{/if}
						</div>
					{/each}
				</div>
				{#if data.versions.length > INITIAL_VERSIONS_COUNT}
					<button class="show-more-btn" onclick={() => (showAllVersions = !showAllVersions)}>
						{showAllVersions ? 'Show less' : `Show all ${data.versions.length} versions`}
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class:rotated={showAllVersions}
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
				{/if}
			</CollapsibleSection>
		{/if}

		<CollapsibleSection title="Reviews" count={reviews.length}>
			{#snippet actions()}
				{#if data.session?.user && !showReviewForm}
					<button class="btn btn-primary" onclick={() => (showReviewForm = true)}>
						{userReview ? 'Edit Review' : 'Write Review'}
					</button>
				{:else if !data.session?.user}
					<a href="/login" class="btn btn-secondary">Log in to Review</a>
				{/if}
			{/snippet}

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
		</CollapsibleSection>

		{#if relatedModules.length > 0}
			<div class="related-section">
				<h2>Related Modules</h2>
				<p class="related-subtitle">More modules in {data.module.category}</p>
				<div class="related-grid">
					{#each relatedModules as relatedModule, i (relatedModule.uuid)}
						<ModuleCard
							uuid={relatedModule.uuid}
							name={relatedModule.name}
							author={relatedModule.author}
							description={relatedModule.description}
							category={relatedModule.category}
							downloads={relatedModule.downloads}
							version={relatedModule.version}
							verified={relatedModule.verified_author}
							createdAt={relatedModule.created_at}
							delay={i * 50}
						/>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</main>

{#if showAddToCollectionModal}
	<Modal
		open={showAddToCollectionModal}
		title="Add to Collection"
		onclose={() => {
			showAddToCollectionModal = false;
			selectedCollectionId = '';
			collectionNote = '';
		}}
	>
		<form
			method="POST"
			action="?/addToCollection"
			use:enhance={() => {
				addingToCollection = true;
				return async ({ result }) => {
					addingToCollection = false;
					if (result.type === 'success') {
						toast.success('Module added to collection!');
						showAddToCollectionModal = false;
						selectedCollectionId = '';
						collectionNote = '';
					} else if (result.type === 'failure') {
						const message =
							(result.data as { message?: string })?.message || 'Failed to add to collection';
						toast.error(message);
					}
				};
			}}
		>
			<div class="form-group">
				<label for="collection-select">Collection</label>
				<select
					id="collection-select"
					name="collection_id"
					bind:value={selectedCollectionId}
					required
				>
					<option value="">Select a collection...</option>
					{#each collections as collection (collection.id)}
						<option value={collection.id}>{collection.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="collection-note">Note (optional)</label>
				<textarea
					id="collection-note"
					name="note"
					bind:value={collectionNote}
					placeholder="Add a note about why you added this module..."
					rows="3"
					maxlength="500"
				></textarea>
			</div>

			<div class="modal-actions">
				<button
					type="button"
					class="btn btn-secondary"
					onclick={() => {
						showAddToCollectionModal = false;
						selectedCollectionId = '';
						collectionNote = '';
					}}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={addingToCollection || !selectedCollectionId}
				>
					{addingToCollection ? 'Adding...' : 'Add to Collection'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

{#if showUploadModal}
	<Modal open={showUploadModal} title="Upload Screenshot" onclose={resetUploadForm}>
		<form
			method="POST"
			action="?/uploadScreenshot"
			enctype="multipart/form-data"
			use:enhance={() => {
				uploadingScreenshot = true;
				return async ({ result, update }) => {
					uploadingScreenshot = false;
					if (result.type === 'success') {
						toast.success('Screenshot uploaded!');
						resetUploadForm();
						await update();
					} else if (result.type === 'failure') {
						const message = (result.data as { message?: string })?.message || 'Failed to upload';
						toast.error(message);
					}
				};
			}}
		>
			<div class="form-group">
				<label for="screenshot-file">Image File</label>
				<div class="file-input-wrapper">
					<input
						type="file"
						id="screenshot-file"
						name="screenshot"
						accept="image/png,image/jpeg,image/webp"
						onchange={handleFileSelect}
						required
					/>
					<div class="file-input-display">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="17 8 12 3 7 8" />
							<line x1="12" y1="3" x2="12" y2="15" />
						</svg>
						{#if selectedFile}
							<span>{selectedFile.name}</span>
						{:else}
							<span>Choose an image (PNG, JPG, WebP - max 2MB)</span>
						{/if}
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="alt-text">Alt Text (optional)</label>
				<input
					type="text"
					id="alt-text"
					name="alt_text"
					bind:value={altTextInput}
					placeholder="Describe the screenshot for accessibility"
					maxlength="200"
				/>
			</div>

			<div class="modal-actions">
				<button type="button" class="btn btn-secondary" onclick={resetUploadForm}> Cancel </button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={uploadingScreenshot || !selectedFile}
				>
					{uploadingScreenshot ? 'Uploading...' : 'Upload Screenshot'}
				</button>
			</div>
		</form>
	</Modal>
{/if}

<Footer />

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
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

	.versions-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.version-card {
		background-color: var(--color-bg-surface);
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.version-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-md);
	}

	.version-info {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.version-date {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.version-downloads {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.version-downloads svg {
		opacity: 0.7;
	}

	.version-changelog {
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--color-text-normal);
	}

	.version-changelog :global(p) {
		margin-bottom: var(--space-sm);
	}

	.version-changelog :global(p:last-child) {
		margin-bottom: 0;
	}

	.version-changelog :global(ul),
	.version-changelog :global(ol) {
		padding-left: var(--space-lg);
		margin-bottom: var(--space-sm);
	}

	.version-changelog :global(li) {
		margin-bottom: var(--space-xs);
	}

	.no-changelog {
		color: var(--color-text-faint);
		font-size: 0.875rem;
		font-style: italic;
	}

	.show-more-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-md);
		margin-top: var(--space-md);
		background: none;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
	}

	.show-more-btn:hover {
		background-color: var(--color-bg-surface);
		color: var(--color-text-normal);
		border-color: var(--color-text-faint);
	}

	.show-more-btn svg {
		transition: transform var(--duration-fast) var(--ease-out);
	}

	.show-more-btn svg.rotated {
		transform: rotate(180deg);
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

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-md);
		margin-top: var(--space-xl);
	}

	select {
		width: 100%;
		padding: var(--space-md);
		padding-right: 40px;
		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-normal);
		font-size: 0.875rem;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: var(--focus-ring);
	}

	/* Screenshots Section */
	.screenshots-section {
		margin-bottom: var(--space-2xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.screenshots-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-lg);
	}

	.screenshots-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.no-screenshots {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-2xl);
		text-align: center;
		color: var(--color-text-muted);
		background-color: var(--color-bg-surface);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
	}

	.no-screenshots svg {
		opacity: 0.3;
	}

	.no-screenshots .hint {
		font-size: 0.875rem;
		color: var(--color-text-faint);
	}

	/* File Input */
	.file-input-wrapper {
		position: relative;
	}

	.file-input-wrapper input[type='file'] {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.file-input-display {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-lg);
		background-color: var(--color-bg-surface);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.file-input-wrapper:hover .file-input-display {
		border-color: var(--color-primary);
	}

	@media (max-width: 768px) {
		.screenshots-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}
	}

	/* Related Modules Section */
	.related-section {
		margin-bottom: var(--space-2xl);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.related-section h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--space-xs);
	}

	.related-subtitle {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-bottom: var(--space-lg);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-lg);
	}

	@media (max-width: 768px) {
		.related-grid {
			grid-template-columns: 1fr;
		}
	}

	/* Sticky Install Bar */
	.sticky-install-bar {
		position: fixed;
		top: 57px;
		left: 0;
		right: 0;
		z-index: 50;
		background-color: var(--color-bg-surface);
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-sm) var(--space-lg);
		box-shadow: var(--shadow-md);
		animation: slideDown 200ms var(--ease-out);
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.sticky-install-content {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-lg);
	}

	.sticky-module-name {
		font-weight: 600;
		font-size: 0.9375rem;
		color: var(--color-text-normal);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.sticky-command {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		background-color: var(--color-bg-elevated);
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-md);
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.8125rem;
		flex-shrink: 0;
	}

	.sticky-command code {
		color: var(--color-text-normal);
	}

	@media (max-width: 768px) {
		.sticky-install-bar {
			padding: var(--space-xs) var(--space-md);
		}

		.sticky-install-content {
			gap: var(--space-md);
		}

		.sticky-module-name {
			font-size: 0.875rem;
			max-width: 120px;
		}

		.sticky-command {
			font-size: 0.75rem;
			padding: var(--space-xs) var(--space-sm);
		}

		.sticky-command code {
			max-width: 150px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	@media (max-width: 480px) {
		.sticky-module-name {
			display: none;
		}

		.sticky-command {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>

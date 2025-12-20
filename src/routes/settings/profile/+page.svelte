<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import CharacterCounter from '$lib/components/CharacterCounter.svelte';
	import ProfileCompleteness from '$lib/components/ProfileCompleteness.svelte';
	import ProfilePreviewCard from '$lib/components/ProfilePreviewCard.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { validateSocialUrl } from '$lib/utils/socialLinks';
	import { getDisplayName, getProfileUsername } from '$lib/utils/displayName';
	import { fromStore } from 'svelte/store';
	import { pinnedModules, MAX_PINNED_MODULES } from '$lib/stores/pinnedModules';

	let { data }: { data: PageData } = $props();

	let displayName = $state('');
	let bio = $state('');
	let websiteUrl = $state('');
	let githubUrl = $state('');
	let twitterUrl = $state('');
	let sponsorUrl = $state('');
	let saving = $state(false);
	let activeSection: 'profile' | 'social' | 'featured' = $state('profile');

	let profile = $derived(data.profile);
	let modules = $derived(data.modules || []);

	let profileData = $derived({
		display_name: displayName || null,
		bio: bio || null,
		website_url: websiteUrl || null,
		avatar_url: data.session?.user?.image || null
	});

	let githubValid = $derived(validateSocialUrl('github', githubUrl));
	let twitterValid = $derived(validateSocialUrl('twitter', twitterUrl));

	let previewDisplayName = $derived(
		getDisplayName(
			displayName,
			profile?.display_name,
			data.session?.user?.name,
			profile?.username || data.session?.user?.login || ''
		)
	);

	let effectiveUsername = $derived(
		getProfileUsername(profile?.username, data.session?.user?.login)
	);

	const pinnedModulesState = fromStore(pinnedModules);

	const currentPinnedModules = $derived(pinnedModulesState.current);

	onMount(() => {
		displayName = data.profile?.display_name || '';
		bio = data.profile?.bio || '';
		websiteUrl = data.profile?.website_url || '';
	});
</script>

<svelte:head>
	<title>Profile Settings - Waybar Marketplace</title>
</svelte:head>

<div class="settings-header">
	<h2>Profile Settings</h2>
	<p class="settings-description">Manage your public profile information and social links.</p>
</div>

<div class="section-tabs">
	<button
		class="section-tab"
		class:active={activeSection === 'profile'}
		onclick={() => (activeSection = 'profile')}
	>
		<svg
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
		Profile
	</button>
	<button
		class="section-tab"
		class:active={activeSection === 'social'}
		onclick={() => (activeSection = 'social')}
	>
		<svg
			viewBox="0 0 24 24"
			width="16"
			height="16"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</svg>
		Social & Links
	</button>
	{#if modules.length > 0}
		<button
			class="section-tab"
			class:active={activeSection === 'featured'}
			onclick={() => (activeSection = 'featured')}
		>
			<svg
				viewBox="0 0 24 24"
				width="16"
				height="16"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<path
					d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
				/>
			</svg>
			Featured
			{#if currentPinnedModules.length > 0}
				<span class="tab-badge">{currentPinnedModules.length}</span>
			{/if}
		</button>
	{/if}
</div>

{#if activeSection === 'profile'}
	<ProfileCompleteness profile={profileData} />
{/if}

<form
	class="settings-form"
	method="POST"
	action="/settings/profile?/updateProfile"
	use:enhance={() => {
		saving = true;
		return async ({ result }) => {
			saving = false;
			if (result.type === 'success') {
				toast.success('Profile saved successfully!');
			} else {
				toast.error('Failed to save profile');
			}
		};
	}}
>
	{#if activeSection === 'profile'}
		<fieldset class="form-section">
			<legend class="section-title">Profile Information</legend>
			<div class="form-group">
				<div class="label-row">
					<label for="displayName">Display Name</label>
					<CharacterCounter current={displayName.length} max={50} />
				</div>
				<input
					type="text"
					id="displayName"
					name="display_name"
					bind:value={displayName}
					placeholder="Your display name"
					maxlength="50"
					aria-describedby="displayName-help"
				/>
				<p id="displayName-help" class="help-text">
					This name will be shown on your profile instead of your GitHub username.
				</p>
			</div>

			<div class="form-group">
				<div class="label-row">
					<label for="bio">Bio</label>
					<CharacterCounter current={bio.length} max={500} />
				</div>
				<textarea
					id="bio"
					name="bio"
					bind:value={bio}
					placeholder="Tell us about yourself..."
					rows="3"
					maxlength="500"
					aria-describedby="bio-help"
				></textarea>
				<p id="bio-help" class="help-text">A short bio to display on your profile page.</p>
			</div>
		</fieldset>
	{/if}

	{#if activeSection === 'social'}
		<fieldset class="form-section">
			<legend class="section-title">Links & Social</legend>
			<div class="form-group">
				<label for="websiteUrl">Website URL</label>
				<input
					type="url"
					id="websiteUrl"
					name="website_url"
					bind:value={websiteUrl}
					placeholder="https://example.com"
					aria-describedby="websiteUrl-help"
				/>
				<p id="websiteUrl-help" class="help-text">Your personal website or blog.</p>
			</div>

			<div class="form-group">
				<label for="githubUrl">GitHub Profile</label>
				<input
					type="url"
					id="githubUrl"
					name="github_url"
					bind:value={githubUrl}
					placeholder="https://github.com/username"
					aria-describedby="githubUrl-help"
					aria-invalid={Boolean(githubUrl) && !githubValid}
					class:input-error={githubUrl && !githubValid}
				/>
				<p id="githubUrl-help" class="help-text">
					{#if githubUrl && !githubValid}
						<span class="error-text">Enter a valid GitHub profile URL</span>
					{:else}
						Link to your GitHub profile (separate from login).
					{/if}
				</p>
			</div>

			<div class="form-group">
				<label for="twitterUrl">Twitter / X</label>
				<input
					type="url"
					id="twitterUrl"
					name="twitter_url"
					bind:value={twitterUrl}
					placeholder="https://x.com/username"
					aria-describedby="twitterUrl-help"
					aria-invalid={Boolean(twitterUrl) && !twitterValid}
					class:input-error={twitterUrl && !twitterValid}
				/>
				<p id="twitterUrl-help" class="help-text">
					{#if twitterUrl && !twitterValid}
						<span class="error-text">Enter a valid Twitter/X profile URL</span>
					{:else}
						Your Twitter or X profile.
					{/if}
				</p>
			</div>

			<div class="form-group sponsor-field">
				<label for="sponsorUrl">
					<svg
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="sponsor-icon"
						aria-hidden="true"
					>
						<path
							d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
						/>
					</svg>
					Sponsor / Donate
				</label>
				<input
					type="url"
					id="sponsorUrl"
					name="sponsor_url"
					bind:value={sponsorUrl}
					placeholder="https://ko-fi.com/username"
					aria-describedby="sponsorUrl-help"
				/>
				<p id="sponsorUrl-help" class="help-text">
					Link to Ko-fi, GitHub Sponsors, Buy Me a Coffee, or other donation page.
				</p>
			</div>
		</fieldset>
	{/if}

	{#if activeSection === 'profile' || activeSection === 'social'}
		<div class="form-actions">
			<button type="submit" class="btn btn-primary" disabled={saving}>
				{#if saving}
					<span class="spinner"></span>
					Saving...
				{:else}
					Save Changes
				{/if}
			</button>
		</div>
	{/if}
</form>

{#if activeSection === 'featured' && modules.length > 0}
	<div class="featured-section">
		<h3 class="section-title">Featured Modules</h3>
		<p class="section-description">
			Pin up to {MAX_PINNED_MODULES} modules to feature on your public profile.
			{currentPinnedModules.length}/{MAX_PINNED_MODULES} pinned.
		</p>
		<div class="pinnable-modules-list">
			{#each modules as module (module.uuid)}
				<div class="pinnable-module">
					<div class="pinnable-module-info">
						<span class="pinnable-module-name">{module.name}</span>
						<span class="pinnable-module-category">{module.category}</span>
					</div>
					<button
						type="button"
						class="pin-toggle"
						class:pinned={pinnedModules.isPinned(module.uuid, currentPinnedModules)}
						onclick={() => pinnedModules.toggle(module.uuid)}
						disabled={!pinnedModules.isPinned(module.uuid, currentPinnedModules) &&
							!pinnedModules.canPin(currentPinnedModules)}
						aria-pressed={pinnedModules.isPinned(module.uuid, currentPinnedModules)}
						aria-label={pinnedModules.isPinned(module.uuid, currentPinnedModules)
							? 'Unpin module'
							: 'Pin module'}
					>
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill={pinnedModules.isPinned(module.uuid, currentPinnedModules)
								? 'currentColor'
								: 'none'}
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path
								d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
							/>
						</svg>
						{pinnedModules.isPinned(module.uuid, currentPinnedModules) ? 'Pinned' : 'Pin'}
					</button>
				</div>
			{/each}
		</div>
	</div>
{/if}

<ProfilePreviewCard
	displayName={previewDisplayName}
	username={effectiveUsername}
	{bio}
	{websiteUrl}
	avatarUrl={data.session?.user?.image || null}
	moduleCount={modules.length}
	verified={profile?.verified_author || false}
	profileUrl={effectiveUsername ? `/users/${effectiveUsername}` : undefined}
/>

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

	.section-tabs {
		display: flex;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.section-tab {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		background: none;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.section-tab:hover {
		color: var(--color-text-normal);
		background-color: var(--color-bg-elevated);
	}

	.section-tab.active {
		color: var(--color-primary);
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
	}

	.section-tab svg {
		flex-shrink: 0;
	}

	.tab-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 var(--space-xs);
		background-color: var(--color-primary);
		color: white;
		font-size: var(--font-size-xs);
		font-weight: 600;
		border-radius: 9px;
	}

	.settings-form {
		margin-bottom: var(--space-lg);
	}

	.form-section {
		border: none;
		padding: 0;
		margin: 0 0 var(--space-lg) 0;
	}

	.section-title {
		font-size: var(--font-size-md);
		font-weight: 600;
		color: var(--color-text-normal);
		margin-bottom: var(--space-md);
	}

	.section-description {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		margin: 0 0 var(--space-md) 0;
	}

	.form-group {
		margin-bottom: var(--space-md);
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xs);
	}

	label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-normal);
		margin-bottom: var(--space-xs);
	}

	.label-row label {
		margin-bottom: 0;
	}

	input[type='text'],
	input[type='url'],
	textarea {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		color: var(--color-text-normal);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
	}

	.input-error {
		border-color: var(--color-danger);
	}

	.help-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin: var(--space-xs) 0 0 0;
	}

	.error-text {
		color: var(--color-danger);
	}

	.sponsor-field label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.sponsor-icon {
		color: var(--color-danger);
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

	.featured-section {
		margin-bottom: var(--space-lg);
	}

	.pinnable-modules-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.pinnable-module {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-sm) var(--space-md);
		background-color: var(--color-bg-base);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.pinnable-module-info {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.pinnable-module-name {
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.pinnable-module-category {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		padding: var(--space-2xs) var(--space-xs);
		background-color: var(--color-bg-elevated);
		border-radius: var(--radius-sm);
	}

	.pin-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		background: none;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.pin-toggle:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-normal);
	}

	.pin-toggle.pinned {
		background-color: color-mix(in srgb, var(--color-warning) 15%, transparent);
		border-color: var(--color-warning);
		color: var(--color-warning);
	}

	.pin-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

<script lang="ts">
	import { calculateProfileCompleteness, type ProfileData } from '$lib/utils/profileCompleteness';

	interface Props {
		profile: ProfileData;
	}

	let { profile }: Props = $props();

	const completeness = $derived(calculateProfileCompleteness(profile));
</script>

<div
	class="profile-completeness"
	role="progressbar"
	aria-valuenow={completeness.percentage}
	aria-valuemin={0}
	aria-valuemax={100}
	aria-label="Profile completion: {completeness.percentage}%"
>
	<div class="completeness-header">
		<span class="completeness-label">Profile Completeness</span>
		<span class="completeness-value">{completeness.filledCount}/{completeness.totalCount}</span>
	</div>
	<div class="progress-track">
		<div
			class="progress-fill"
			class:incomplete={completeness.state === 'incomplete'}
			class:partial={completeness.state === 'partial'}
			class:complete={completeness.state === 'complete'}
			style="width: {completeness.percentage}%"
		></div>
	</div>
	{#if completeness.suggestions.length > 0}
		<ul class="suggestions" aria-label="Profile improvement suggestions">
			{#each completeness.suggestions.slice(0, 2) as suggestion, i (i)}
				<li>{suggestion}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.profile-completeness {
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.completeness-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.completeness-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-normal);
	}

	.completeness-value {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
	}

	.progress-track {
		height: 6px;
		background-color: var(--color-bg-surface);
		border-radius: var(--radius-full);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: var(--radius-full);
		transition: width var(--duration-normal) var(--ease-out);
	}

	.progress-fill.incomplete {
		background-color: var(--color-text-muted);
	}

	.progress-fill.partial {
		background-color: var(--color-warning, #f59e0b);
	}

	.progress-fill.complete {
		background-color: var(--color-success, #22c55e);
	}

	.suggestions {
		margin-top: var(--space-sm);
		padding-left: var(--space-md);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		list-style: disc;
	}

	.suggestions li {
		margin-bottom: var(--space-2xs);
	}

	.suggestions li:last-child {
		margin-bottom: 0;
	}
</style>

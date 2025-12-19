<script lang="ts">
	interface Props {
		src?: string | null;
		alt?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		name?: string;
	}

	let { src, alt = '', size = 'md', name }: Props = $props();

	const initial = $derived(name ? name.charAt(0).toUpperCase() : '?');
</script>

{#if src}
	<img {src} {alt} class="avatar avatar-{size}" />
{:else}
	<div class="avatar-placeholder avatar-{size}" aria-hidden="true">
		{initial}
	</div>
{/if}

<style>
	.avatar {
		border-radius: 50%;
		flex-shrink: 0;
		object-fit: cover;
	}

	.avatar-placeholder {
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		flex-shrink: 0;
	}

	.avatar-sm {
		width: 24px;
		height: 24px;
		font-size: 0.6875rem;
	}

	.avatar-md {
		width: 32px;
		height: 32px;
		font-size: 0.8125rem;
	}

	.avatar-lg {
		width: 48px;
		height: 48px;
		font-size: 1.25rem;
	}

	.avatar-xl {
		width: 120px;
		height: 120px;
		font-size: 3rem;
	}

	img.avatar {
		border: 2px solid var(--color-border);
	}

	.avatar-xl.avatar {
		border-width: 3px;
	}
</style>

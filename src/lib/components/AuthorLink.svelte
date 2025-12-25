<script lang="ts">
	import HoverCard from './HoverCard.svelte';
	import UserHoverCard from './UserHoverCard.svelte';

	interface Props {
		username: string;
		class?: string;
	}

	let { username, class: className = '' }: Props = $props();
</script>

<HoverCard>
	{#snippet trigger()}
		<a href="/users/{username}" class="author-link {className}">{username}</a>
	{/snippet}
	{#snippet content()}
		<UserHoverCard {username} />
	{/snippet}
</HoverCard>

<style>
	.author-link {
		color: inherit;
		text-decoration: none;
	}

	.author-link:hover {
		text-decoration: underline;
	}
</style>

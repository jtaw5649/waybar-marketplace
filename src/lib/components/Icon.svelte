<script lang="ts">
	import Icon, { addCollection } from '@iconify/svelte';
	import { icons as simpleIcons } from '@iconify-json/simple-icons';

	addCollection(simpleIcons);

	let {
		name,
		size = 20,
		class: className = '',
		ariaLabel
	}: {
		name: string;
		size?: number;
		class?: string;
		ariaLabel?: string;
	} = $props();
</script>

{#if name === 'logo'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 256 256"
		width={size}
		height={size}
		class={className}
		aria-label={ariaLabel}
		aria-hidden={ariaLabel ? 'false' : 'true'}
	>
		<rect width="256" height="256" fill="none" />
		<line
			x1="208"
			y1="128"
			x2="128"
			y2="208"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="32"
		/>
		<line
			x1="192"
			y1="40"
			x2="40"
			y2="192"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="32"
		/>
	</svg>
{:else}
	<Icon
		icon={name}
		width={size}
		height={size}
		class={className}
		aria-label={ariaLabel}
		aria-hidden={ariaLabel ? 'false' : 'true'}
	/>
{/if}

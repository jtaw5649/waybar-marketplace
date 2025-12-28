<script lang="ts">
	import github from '@iconify/icons-simple-icons/github';
	import svelte from '@iconify/icons-simple-icons/svelte';
	import typescript from '@iconify/icons-simple-icons/typescript';
	import cloudflare from '@iconify/icons-simple-icons/cloudflare';
	import rust from '@iconify/icons-simple-icons/rust';
	import gnubash from '@iconify/icons-simple-icons/gnubash';
	import archlinux from '@iconify/icons-simple-icons/archlinux';

	type IconData = {
		body: string;
		width?: number;
		height?: number;
	};

	const simpleIconMap: Record<string, IconData> = {
		'simple-icons:github': github,
		'simple-icons:svelte': svelte,
		'simple-icons:typescript': typescript,
		'simple-icons:cloudflare': cloudflare,
		'simple-icons:rust': rust,
		'simple-icons:gnubash': gnubash,
		'simple-icons:archlinux': archlinux
	};

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

	const iconData = $derived(simpleIconMap[name]);
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
{:else if iconData}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox={`0 0 ${iconData.width ?? 24} ${iconData.height ?? 24}`}
		width={size}
		height={size}
		class={className}
		aria-label={ariaLabel}
		aria-hidden={ariaLabel ? 'false' : 'true'}
	>
		{@html iconData.body}
	</svg>
{:else}
	<span class={className} aria-hidden="true"></span>
{/if}

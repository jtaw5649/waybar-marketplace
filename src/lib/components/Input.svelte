<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'text' | 'email' | 'password' | 'url' | 'number' | 'search';
		size?: 'sm' | 'md' | 'lg';
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		id?: string;
		name?: string;
		maxlength?: number;
		pattern?: string;
		prefix?: Snippet;
		suffix?: Snippet;
		oninput?: (e: Event) => void;
		onchange?: (e: Event) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
	}

	let {
		type = 'text',
		size = 'md',
		value = $bindable(''),
		placeholder,
		disabled = false,
		required = false,
		error,
		id,
		name,
		maxlength,
		pattern,
		prefix,
		suffix,
		oninput,
		onchange,
		onfocus,
		onblur
	}: Props = $props();

	const hasPrefix = $derived(!!prefix);
	const hasSuffix = $derived(!!suffix);
	const hasError = $derived(!!error);
	const errorId = $derived(id ? `${id}-error` : undefined);
</script>

<div
	class="input-wrapper input-{size}"
	class:has-prefix={hasPrefix}
	class:has-suffix={hasSuffix}
	class:has-error={hasError}
>
	{#if prefix}
		<span class="input-prefix">
			{@render prefix()}
		</span>
	{/if}

	<input
		{type}
		{id}
		{name}
		{placeholder}
		{disabled}
		{required}
		{maxlength}
		{pattern}
		bind:value
		class:error={hasError}
		aria-invalid={hasError}
		aria-describedby={hasError && errorId ? errorId : undefined}
		{oninput}
		{onchange}
		{onfocus}
		{onblur}
	/>

	{#if suffix}
		<span class="input-suffix">
			{@render suffix()}
		</span>
	{/if}
</div>

{#if error}
	<p class="input-error" id={errorId} role="alert">{error}</p>
{/if}

<style>
	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	input {
		width: 100%;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg-base);
		color: var(--color-text-normal);
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	input::placeholder {
		color: var(--color-text-faint);
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(97, 125, 250, 0.15);
	}

	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--color-bg-surface);
	}

	input.error {
		border-color: var(--color-error);
	}

	input.error:focus {
		box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
	}

	.input-sm input {
		padding: var(--space-xs) var(--space-sm);
		font-size: 0.8125rem;
	}

	.input-md input {
		padding: var(--space-sm) var(--space-md);
		font-size: 0.875rem;
	}

	.input-lg input {
		padding: var(--space-md) var(--space-lg);
		font-size: 1rem;
	}

	.has-prefix input {
		padding-left: calc(var(--space-2xl) + var(--space-sm));
	}

	.has-suffix input {
		padding-right: calc(var(--space-2xl) + var(--space-sm));
	}

	.input-prefix,
	.input-suffix {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-faint);
		pointer-events: none;
	}

	.input-prefix {
		left: var(--space-md);
	}

	.input-suffix {
		right: var(--space-md);
	}

	.input-error {
		margin-top: var(--space-xs);
		font-size: 0.8125rem;
		color: var(--color-error);
	}
</style>

import { stars } from '$lib/stores/stars.svelte';
import { getCategoryVariant, getCategoryColor, SEVEN_DAYS_MS } from '$lib/constants';

interface ModuleCardInput {
	uuid: string;
	category: string;
	createdAt?: string;
}

export function useModuleCard(getProps: () => ModuleCardInput) {
	const props = $derived(getProps());

	const categoryVariant = $derived(getCategoryVariant(props.category));
	const categoryColor = $derived(getCategoryColor(props.category));
	const isNew = $derived(
		props.createdAt ? Date.now() - Date.parse(props.createdAt) < SEVEN_DAYS_MS : false
	);
	const isStarred = $derived(stars.isStarred(props.uuid));

	return {
		get categoryVariant() {
			return categoryVariant;
		},
		get categoryColor() {
			return categoryColor;
		},
		get isNew() {
			return isNew;
		},
		get isStarred() {
			return isStarred;
		}
	};
}

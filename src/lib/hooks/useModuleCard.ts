import { fromStore } from 'svelte/store';
import { stars } from '$lib/stores/stars';
import { getCategoryVariant, getCategoryColor, SEVEN_DAYS_MS } from '$lib/constants';

interface ModuleCardInput {
	uuid: string;
	category: string;
	createdAt?: string;
}

export function useModuleCard(props: ModuleCardInput) {
	const starsState = fromStore(stars);

	const categoryVariant = getCategoryVariant(props.category);
	const categoryColor = getCategoryColor(props.category);
	const isNew = props.createdAt
		? Date.now() - new Date(props.createdAt).getTime() < SEVEN_DAYS_MS
		: false;
	const isStarred = starsState.current.starred.has(props.uuid);

	return { categoryVariant, categoryColor, isNew, isStarred };
}

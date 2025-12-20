export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type TagVariant = 'purple' | 'blue' | 'green' | 'amber' | 'pink' | 'teal' | 'gray';

export const CATEGORY_VARIANTS: Record<string, TagVariant> = {
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
	clock: 'amber'
};

export const VARIANT_COLORS: Record<TagVariant, string> = {
	purple: '#617dfa',
	blue: '#06b6d4',
	green: '#10b981',
	amber: '#f59e0b',
	pink: '#ec4899',
	teal: '#14b8a6',
	gray: '#6b7280'
};

export function getCategoryVariant(category: string): TagVariant {
	return CATEGORY_VARIANTS[category.toLowerCase()] || 'gray';
}

export function getCategoryColor(category: string): string {
	const variant = getCategoryVariant(category);
	return VARIANT_COLORS[variant];
}

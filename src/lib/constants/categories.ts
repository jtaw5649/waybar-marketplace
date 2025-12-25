export interface Category {
	name: string;
	slug: string;
	icon: string;
	color: string;
}

export const CATEGORIES: readonly Category[] = [
	{ name: 'System', slug: 'system', icon: '/icons/category-system.svg', color: '#617dfa' },
	{ name: 'Hardware', slug: 'hardware', icon: '/icons/category-hardware.svg', color: '#10b981' },
	{ name: 'Network', slug: 'network', icon: '/icons/category-network.svg', color: '#f59e0b' },
	{ name: 'Audio', slug: 'audio', icon: '/icons/category-audio.svg', color: '#f97316' },
	{ name: 'Power', slug: 'power', icon: '/icons/category-power.svg', color: '#22c55e' },
	{ name: 'Time', slug: 'time', icon: '/icons/category-time.svg', color: '#3b82f6' },
	{ name: 'Clock', slug: 'clock', icon: '/icons/category-clock.svg', color: '#06b6d4' },
	{ name: 'Workspace', slug: 'workspace', icon: '/icons/category-workspace.svg', color: '#8b5cf6' },
	{ name: 'Window', slug: 'window', icon: '/icons/category-window.svg', color: '#a855f7' },
	{ name: 'Tray', slug: 'tray', icon: '/icons/category-tray.svg', color: '#6366f1' },
	{ name: 'Weather', slug: 'weather', icon: '/icons/category-weather.svg', color: '#0ea5e9' },
	{
		name: 'Productivity',
		slug: 'productivity',
		icon: '/icons/category-productivity.svg',
		color: '#14b8a6'
	},
	{ name: 'Media', slug: 'media', icon: '/icons/category-media.svg', color: '#ec4899' },
	{ name: 'Custom', slug: 'custom', icon: '/icons/category-custom.svg', color: '#64748b' }
] as const;

export function getCategorySlugs(): string[] {
	return CATEGORIES.map((c) => c.slug);
}

export function getBrowseCategories(): { name: string; slug: string }[] {
	return [{ name: 'All', slug: '' }, ...CATEGORIES.map(({ name, slug }) => ({ name, slug }))];
}

export function getHomepageCategories(): Category[] {
	const featured = ['system', 'hardware', 'network', 'media', 'workspace', 'clock'];
	return CATEGORIES.filter((c) => featured.includes(c.slug));
}

export function getCategoryBySlug(slug: string): Category | undefined {
	return CATEGORIES.find((c) => c.slug === slug.toLowerCase());
}

export function getCategoryName(slug: string): string {
	return getCategoryBySlug(slug)?.name ?? slug;
}

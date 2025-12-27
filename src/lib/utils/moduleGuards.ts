import type { Module, StarredModule } from '$lib/types';

const isStringArray = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((entry) => typeof entry === 'string');

export const isRegistryModule = (value: unknown): value is Module => {
	if (!value || typeof value !== 'object') return false;
	const record = value as Record<string, unknown>;
	return (
		typeof record.uuid === 'string' &&
		typeof record.name === 'string' &&
		typeof record.repo_url === 'string' &&
		isStringArray(record.tags)
	);
};

export const isStarredModule = (value: unknown): value is StarredModule => {
	if (!isRegistryModule(value)) return false;
	const record = value as Record<string, unknown>;
	return typeof record.starred_at === 'string';
};

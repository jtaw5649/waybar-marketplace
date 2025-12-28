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

export class ModuleValidationError extends Error {
	constructor(
		message: string,
		public readonly data: unknown
	) {
		super(message);
		this.name = 'ModuleValidationError';
	}
}

export function validateModule(data: unknown, context?: string): Module {
	if (!isRegistryModule(data)) {
		const ctx = context ? ` (${context})` : '';
		throw new ModuleValidationError(`Invalid module data received from API${ctx}`, data);
	}
	return data;
}

export function validateModules(data: unknown, context?: string): Module[] {
	if (!Array.isArray(data)) {
		const ctx = context ? ` (${context})` : '';
		throw new ModuleValidationError(`Expected array of modules${ctx}`, data);
	}
	return data.map((item, index) =>
		validateModule(item, context ? `${context}[${index}]` : `[${index}]`)
	);
}

export function validateStarredModule(data: unknown, context?: string): StarredModule {
	if (!isStarredModule(data)) {
		const ctx = context ? ` (${context})` : '';
		throw new ModuleValidationError(`Invalid starred module data received from API${ctx}`, data);
	}
	return data;
}

export function validateStarredModules(data: unknown, context?: string): StarredModule[] {
	if (!Array.isArray(data)) {
		const ctx = context ? ` (${context})` : '';
		throw new ModuleValidationError(`Expected array of starred modules${ctx}`, data);
	}
	return data.map((item, index) =>
		validateStarredModule(item, context ? `${context}[${index}]` : `[${index}]`)
	);
}

export type PaletteMode = 'all' | 'modules' | 'pages' | 'commands';

export interface PaletteItem {
	id: string;
	name: string;
	description?: string;
	type: 'module' | 'page' | 'command';
	icon?: string;
	action?: () => void;
	path?: string;
}

export interface ModuleVersion {
	major: number;
	minor: number;
	patch: number;
}

export interface Module {
	uuid: string;
	name: string;
	author: string;
	description: string;
	category: string;
	downloads: number;
	rating: number | null;
	verified_author: boolean;
	created_at: string;
	updated_at?: string;
	version?: string;
	repo_url?: string;
	icon?: string;
}

export interface PageItem extends PaletteItem {
	type: 'page';
	path: string;
}

export interface CommandItem extends PaletteItem {
	type: 'command';
	action: () => void;
}

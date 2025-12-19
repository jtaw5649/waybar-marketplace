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

export interface Module {
	uuid: string;
	name: string;
	description: string;
	author: string;
	category: string;
	downloads?: number;
}

export interface PageItem extends PaletteItem {
	type: 'page';
	path: string;
}

export interface CommandItem extends PaletteItem {
	type: 'command';
	action: () => void;
}

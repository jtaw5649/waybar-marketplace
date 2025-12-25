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

export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserProfileBase {
	id: number;
	username: string;
	display_name: string | null;
	avatar_url: string | null;
	bio: string | null;
	website_url: string | null;
	verified_author: boolean;
	module_count: number;
	created_at: string;
}

export interface UserProfile extends UserProfileBase {
	role?: UserRole;
	github_url?: string | null;
	twitter_url?: string | null;
	bluesky_url?: string | null;
	discord_url?: string | null;
	sponsor_url?: string | null;
}

export type CollectionVisibility = 'private' | 'public' | 'unlisted';

export interface CollectionBase {
	id: number;
	name: string;
	description: string | null;
	visibility: CollectionVisibility;
	module_count: number;
	created_at: string;
	updated_at?: string;
}

export interface Collection extends CollectionBase {
	updated_at: string;
}

export interface CollectionOwner {
	username: string;
	display_name: string | null;
	avatar_url: string | null;
}

export interface CollectionModule {
	uuid: string;
	name: string;
	author: string;
	category: string;
	note: string | null;
	position: number;
	added_at: string;
}

export interface CollectionDetail extends CollectionBase {
	modules: CollectionModule[];
	owner: CollectionOwner;
	updated_at: string;
}

export interface Screenshot {
	id: number;
	r2_key: string;
	alt_text: string | null;
	position: number;
	created_at: string;
}

export interface ReviewUser {
	username: string;
	avatar_url: string | null;
}

export interface Review {
	id: number;
	rating: number;
	title: string | null;
	body: string | null;
	helpful_count: number;
	created_at: string;
	updated_at: string | null;
	user: ReviewUser;
}

export interface VersionHistoryEntry {
	version: string;
	changelog: string | null;
	downloads: number;
	published_at: string;
}

export interface RelatedModule {
	uuid: string;
	name: string;
	author: string;
	description: string;
	category: string;
	downloads: number;
	verified_author: boolean;
	version?: string;
	created_at?: string;
}

export interface PageItem extends PaletteItem {
	type: 'page';
	path: string;
}

export interface CommandItem extends PaletteItem {
	type: 'command';
	action: () => void;
}

export interface LandingStats {
	total_modules: number;
	total_downloads: number;
	total_authors: number;
}

export interface LandingInstallMethod {
	id: string;
	label: string;
	description: string;
	commands: string[];
}

export interface LandingData {
	stats: LandingStats;
	install_methods: LandingInstallMethod[];
}

export interface LandingResponse extends LandingData {
	version: number;
}

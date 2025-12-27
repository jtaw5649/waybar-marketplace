import type { components } from './api-types';

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

export type ModuleVersion = components['schemas']['ModuleVersion'];
export type ModuleCategory = components['schemas']['ModuleCategory'];
export type Module = components['schemas']['RegistryModule'];
export type StarredModule = components['schemas']['StarredModule'];
export type StarsResponse = components['schemas']['StarsResponse'];

export type UserRole = components['schemas']['UserRole'];
export type UserProfile = components['schemas']['UserProfile'];

export type CollectionVisibility = 'private' | 'public' | 'unlisted';

export type CollectionOwner = components['schemas']['CollectionOwner'];
export type CollectionModule = components['schemas']['CollectionModule'];
export type CollectionBase = components['schemas']['Collection'];
export type Collection = components['schemas']['Collection'];
export type CollectionDetail = components['schemas']['Collection'] & {
	modules: components['schemas']['CollectionModule'][];
};

export type Screenshot = components['schemas']['Screenshot'];
export type ReviewUser = components['schemas']['ReviewUser'];
export type Review = components['schemas']['Review'];
export type VersionHistoryEntry = components['schemas']['VersionHistoryEntry'];

export interface PageItem extends PaletteItem {
	type: 'page';
	path: string;
}

export interface CommandItem extends PaletteItem {
	type: 'command';
	action: () => void;
}

export type LandingStats = components['schemas']['PublicStats'];
export type LandingInstallMethod = components['schemas']['LandingInstallMethod'];
export type LandingData = components['schemas']['LandingData'];
export type LandingResponse = components['schemas']['ApiVersion'] &
	components['schemas']['LandingData'];

export type NotificationType = 'downloads' | 'comments' | 'stars' | 'updates' | 'announcements';

export type NotificationStatus = 'unread' | 'read' | 'done';

export interface NotificationPreference {
	type: NotificationType;
	email: boolean;
	inApp: boolean;
}

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	link?: string;
	status: NotificationStatus;
	createdAt: string;
	readAt?: string;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
	downloads: 'Download milestones',
	comments: 'New comments',
	stars: 'New stars',
	updates: 'Module updates',
	announcements: 'Platform announcements'
};

export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
	downloads: 'Get notified when your modules reach download milestones (100, 1k, 10k, etc.)',
	comments: 'When someone comments on your modules',
	stars: 'When someone stars your modules',
	updates: 'When modules you starred release new versions',
	announcements: 'Important updates about Barforge'
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
	{ type: 'downloads', email: false, inApp: true },
	{ type: 'comments', email: false, inApp: true },
	{ type: 'stars', email: false, inApp: true },
	{ type: 'updates', email: false, inApp: true },
	{ type: 'announcements', email: true, inApp: true }
];

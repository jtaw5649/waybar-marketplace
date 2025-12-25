import type { Session } from '@auth/sveltekit';

declare module '@auth/core/types' {
	interface User {
		id?: string;
		login?: string;
	}
}

declare module '@auth/sveltekit' {
	interface Session {
		user?: {
			id?: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			login?: string;
		};
		error?: string;
	}
}

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
		}
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};

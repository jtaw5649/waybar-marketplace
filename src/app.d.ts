import type { Session } from '@auth/sveltekit';

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

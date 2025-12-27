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
				AUTH_SECRET?: string;
				AUTH_TRUST_HOST?: string;
				AUTH_GITHUB_ID?: string;
				AUTH_GITHUB_SECRET?: string;
				CF_PAGES?: string;
				VERCEL?: string;
				TURNSTILE_SITE_KEY?: string;
				TURNSTILE_SECRET?: string;
				RESEND_API_KEY?: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};

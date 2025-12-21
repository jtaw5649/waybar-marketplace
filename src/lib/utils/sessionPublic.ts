import type { Session } from '@auth/sveltekit';

export type PublicSession = Omit<Session, 'accessToken'>;

export function toPublicSession(session: Session | null): PublicSession | null {
	if (!session) return null;
	const { accessToken: _accessToken, ...rest } = session;
	return rest;
}

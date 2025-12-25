import type { Session } from '@auth/sveltekit';

type SessionWithToken = Session & { accessToken?: string };

export type PublicSession = Session;

export function toPublicSession(session: Session | null): PublicSession | null {
	if (!session) return null;
	const { accessToken: _accessToken, ...safeSession } = session as SessionWithToken;
	return safeSession;
}

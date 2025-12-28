import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { produce } from 'sveltekit-sse';
import { API_BASE_URL } from '$lib';
import { authHeaders } from '$lib/server/authHeaders';
import { resolveAccessToken } from '$lib/server/token';

const allowedEventTypes = new Set(['message', 'notification']);

export const GET: RequestHandler = async ({ cookies, locals, platform }) => {
	const session = await locals.auth();
	const accessToken = await resolveAccessToken(cookies, session, platform?.env?.AUTH_SECRET);
	if (!accessToken) {
		throw error(401, 'Unauthorized');
	}

	return produce(async function start({ emit, lock }) {
		const res = await fetch(`${API_BASE_URL}/api/v1/notifications/stream`, {
			headers: authHeaders(accessToken, {
				Accept: 'text/event-stream'
			})
		});

		if (!res.ok || !res.body) {
			lock.set(false);
			return;
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let buffer = '';
		const emitEvents = (rawEvents: string[]) => {
			for (const rawEvent of rawEvents) {
				const lines = rawEvent.split('\n');
				let eventType = 'message';
				const dataLines: string[] = [];

				for (const line of lines) {
					const normalized = line.endsWith('\r') ? line.slice(0, -1) : line;
					if (normalized.startsWith('event:')) {
						eventType = normalized.slice(6).trim() || 'message';
						continue;
					}
					if (normalized.startsWith('data:')) {
						dataLines.push(normalized.slice(5).trimStart());
					}
				}

				if (dataLines.length) {
					const data = dataLines.join('\n');
					if (!allowedEventTypes.has(eventType)) {
						continue;
					}
					const { error: emitError } = emit(eventType, data);
					if (emitError) {
						lock.set(false);
						return false;
					}
				}
			}

			return true;
		};

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			buffer = buffer.replace(/\r\n/g, '\n');
			const events = buffer.split('\n\n');
			buffer = events.pop() ?? '';

			if (!emitEvents(events)) {
				return;
			}
		}

		buffer += decoder.decode();
		buffer = buffer.replace(/\r\n/g, '\n');
		const remainingEvents = buffer.split('\n\n');
		buffer = remainingEvents.pop() ?? '';
		if (!emitEvents(remainingEvents)) {
			return;
		}

		lock.set(false);
	});
};

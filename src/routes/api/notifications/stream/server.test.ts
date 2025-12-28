import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './+server';
import { resolveAccessToken } from '$lib/server/token';

let emitSpy = vi.fn();

vi.mock('$lib/server/token', () => ({
	resolveAccessToken: vi.fn()
}));

vi.mock('sveltekit-sse', () => ({
	produce: vi.fn(
		async (
			start: (options: {
				emit: typeof emitSpy;
				lock: { set: (value: boolean) => void };
			}) => Promise<void>
		) => {
			emitSpy = vi.fn(() => ({ error: null }));
			const lock = { set: vi.fn() };
			await start({ emit: emitSpy, lock });
			return new Response();
		}
	)
}));

type StreamEvent = Parameters<typeof GET>[0];

const makeEvent = (request?: Request): StreamEvent =>
	({
		cookies: {} as StreamEvent['cookies'],
		locals: { auth: vi.fn().mockResolvedValue({ accessToken: 'token' }) },
		request: request ?? new Request('http://localhost/api/notifications/stream')
	}) as unknown as StreamEvent;

const makeStream = (chunks: string[]) => {
	const encoder = new TextEncoder();
	let index = 0;
	return new ReadableStream<Uint8Array>({
		pull(controller) {
			if (index >= chunks.length) {
				controller.close();
				return;
			}
			controller.enqueue(encoder.encode(chunks[index]));
			index += 1;
		}
	});
};

const makeBinaryStream = (chunks: Uint8Array[]) => {
	let index = 0;
	return new ReadableStream<Uint8Array>({
		pull(controller) {
			if (index >= chunks.length) {
				controller.close();
				return;
			}
			controller.enqueue(chunks[index]);
			index += 1;
		}
	});
};

describe('notifications stream api', () => {
	beforeEach(() => {
		emitSpy = vi.fn();
		vi.stubGlobal('fetch', vi.fn());
		vi.mocked(resolveAccessToken).mockResolvedValue('token');
	});

	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it('requests the SSE stream with text/event-stream accept header', async () => {
		const fetchMock = vi.mocked(fetch);
		const stream = makeStream([]);
		fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));

		await GET(makeEvent());

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/v1/notifications/stream'),
			expect.objectContaining({
				headers: expect.objectContaining({ Accept: 'text/event-stream' })
			})
		);
	});

	it('does not forward Last-Event-ID from the client', async () => {
		const fetchMock = vi.mocked(fetch);
		const stream = makeStream([]);
		fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));

		const request = new Request('http://localhost/api/notifications/stream', {
			headers: { 'Last-Event-ID': '10' }
		});

		await GET(makeEvent(request));

		const options = fetchMock.mock.calls[0][1] as RequestInit;
		expect(options.headers).toEqual(
			expect.not.objectContaining({
				'Last-Event-ID': '10'
			})
		);
	});

	it('emits notification events from SSE data', async () => {
		const fetchMock = vi.mocked(fetch);
		const stream = makeStream(['event: notification\r\ndata: hello\r\n\r\n']);
		fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));

		await GET(makeEvent());

		expect(emitSpy).toHaveBeenCalledWith('notification', 'hello');
	});

	it('preserves UTF-8 characters split across chunks', async () => {
		const fetchMock = vi.mocked(fetch);
		const encoder = new TextEncoder();
		const prefix = encoder.encode('event: notification\ndata: ');
		const emoji = encoder.encode('🔥');
		const suffix = encoder.encode('\n\n');
		const stream = makeBinaryStream([prefix, emoji.slice(0, 2), emoji.slice(2), suffix]);
		fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));

		await GET(makeEvent());

		expect(emitSpy).toHaveBeenCalledWith('notification', '🔥');
	});

	it('ignores unknown SSE event types', async () => {
		const fetchMock = vi.mocked(fetch);
		const stream = makeStream(['event: admin\r\ndata: hello\r\n\r\n']);
		fetchMock.mockResolvedValueOnce(new Response(stream, { status: 200 }));

		await GET(makeEvent());

		expect(emitSpy).not.toHaveBeenCalled();
	});
});

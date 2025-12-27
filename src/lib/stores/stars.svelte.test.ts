import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$lib/utils/starsResponse', () => ({
	normalizeStarsPayload: vi.fn()
}));

vi.mock('$lib/utils/url', () => ({
	encodeModuleUuid: vi.fn((uuid: string) => encodeURIComponent(uuid).replace(/%40/g, '@'))
}));

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: () => {
			store = {};
		},
		_getStore: () => store,
		_setStore: (newStore: Record<string, string>) => {
			store = newStore;
		}
	};
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('StarsStore', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.stubGlobal('fetch', vi.fn());
		vi.resetModules();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('initial state', () => {
		it('starts with empty starred set when no stored data', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.isStarred('any-uuid')).toBe(false);
		});

		it('loads starred modules from localStorage on initialization', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['uuid-1', 'uuid-2'])
			});
			const { stars } = await import('./stars.svelte');
			expect(stars.isStarred('uuid-1')).toBe(true);
			expect(stars.isStarred('uuid-2')).toBe(true);
			expect(stars.isStarred('uuid-3')).toBe(false);
		});

		it('handles invalid JSON in localStorage gracefully', async () => {
			localStorageMock._setStore({
				starred_modules: 'not-valid-json'
			});
			const { stars } = await import('./stars.svelte');
			expect(stars.isStarred('any-uuid')).toBe(false);
		});

		it('starts with isAuthenticated as false', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.isAuthenticated).toBe(false);
		});

		it('starts with syncing as false', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.syncing).toBe(false);
		});
	});

	describe('isStarred', () => {
		it('returns true for starred modules', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['uuid-1'])
			});
			const { stars } = await import('./stars.svelte');
			expect(stars.isStarred('uuid-1')).toBe(true);
		});

		it('returns false for non-starred modules', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.isStarred('non-existent-uuid')).toBe(false);
		});

		it('handles module-style uuids with @ symbol', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['cpu-monitor@system'])
			});
			const { stars } = await import('./stars.svelte');
			expect(stars.isStarred('cpu-monitor@system')).toBe(true);
		});
	});

	describe('getStarCount', () => {
		it('returns stored count for module', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setStarCount('uuid-1', 42);
			expect(stars.getStarCount('uuid-1')).toBe(42);
		});

		it('returns 0 for unknown module', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.getStarCount('unknown-uuid')).toBe(0);
		});

		it('returns 0 when count is explicitly set to 0', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setStarCount('uuid-1', 0);
			expect(stars.getStarCount('uuid-1')).toBe(0);
		});
	});

	describe('setStarCount', () => {
		it('sets count for a module', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setStarCount('uuid-1', 100);
			expect(stars.getStarCount('uuid-1')).toBe(100);
		});

		it('overwrites existing count', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setStarCount('uuid-1', 50);
			stars.setStarCount('uuid-1', 75);
			expect(stars.getStarCount('uuid-1')).toBe(75);
		});

		it('handles multiple modules independently', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setStarCount('uuid-1', 10);
			stars.setStarCount('uuid-2', 20);
			expect(stars.getStarCount('uuid-1')).toBe(10);
			expect(stars.getStarCount('uuid-2')).toBe(20);
		});
	});

	describe('setAuthenticated', () => {
		it('sets isAuthenticated to true', async () => {
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [], total: 0 })
			} as Response);

			stars.setAuthenticated(true);
			expect(stars.isAuthenticated).toBe(true);
		});

		it('sets isAuthenticated to false', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setAuthenticated(false);
			expect(stars.isAuthenticated).toBe(false);
		});

		it('triggers syncWithServer when set to true', async () => {
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [], total: 0 })
			} as Response);

			stars.setAuthenticated(true);

			await vi.waitFor(() => {
				expect(fetch).toHaveBeenCalledWith('/api/stars');
			});
		});

		it('does not trigger syncWithServer when set to false', async () => {
			const { stars } = await import('./stars.svelte');
			stars.setAuthenticated(false);

			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(fetch).not.toHaveBeenCalled();
		});
	});

	describe('toggle', () => {
		describe('when not authenticated', () => {
			it('adds module to starred set when not starred', async () => {
				const { stars } = await import('./stars.svelte');
				const result = await stars.toggle('uuid-1');
				expect(result).toBe(true);
				expect(stars.isStarred('uuid-1')).toBe(true);
			});

			it('removes module from starred set when starred', async () => {
				localStorageMock._setStore({
					starred_modules: JSON.stringify(['uuid-1'])
				});
				const { stars } = await import('./stars.svelte');
				const result = await stars.toggle('uuid-1');
				expect(result).toBe(false);
				expect(stars.isStarred('uuid-1')).toBe(false);
			});

			it('persists changes to localStorage when adding', async () => {
				const { stars } = await import('./stars.svelte');
				await stars.toggle('uuid-1');
				const stored = JSON.parse(localStorageMock.getItem('starred_modules') || '[]');
				expect(stored).toContain('uuid-1');
			});

			it('persists changes to localStorage when removing', async () => {
				localStorageMock._setStore({
					starred_modules: JSON.stringify(['uuid-1', 'uuid-2'])
				});
				const { stars } = await import('./stars.svelte');
				await stars.toggle('uuid-1');
				const stored = JSON.parse(localStorageMock.getItem('starred_modules') || '[]');
				expect(stored).not.toContain('uuid-1');
				expect(stored).toContain('uuid-2');
			});

			it('does not make API call when not authenticated', async () => {
				const { stars } = await import('./stars.svelte');
				await stars.toggle('uuid-1');
				expect(fetch).not.toHaveBeenCalled();
			});
		});

		describe('when authenticated', () => {
			it('makes POST request when starring', async () => {
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ modules: [], total: 0 })
				} as Response);

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));
				vi.mocked(fetch).mockClear();

				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ success: true })
				} as Response);

				await stars.toggle('uuid-1');

				expect(fetch).toHaveBeenCalledWith('/api/modules/uuid-1/star', { method: 'POST' });
			});

			it('makes DELETE request when unstarring', async () => {
				localStorageMock._setStore({
					starred_modules: JSON.stringify(['uuid-1'])
				});
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({
					modules: [{ uuid: 'uuid-1' }],
					total: 1
				});
				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ modules: [{ uuid: 'uuid-1' }], total: 1 })
				} as Response);

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));
				vi.mocked(fetch).mockClear();

				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ success: true })
				} as Response);

				await stars.toggle('uuid-1');

				expect(fetch).toHaveBeenCalledWith('/api/modules/uuid-1/star', { method: 'DELETE' });
			});

			it('rolls back on API error response', async () => {
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ modules: [], total: 0 })
				} as Response);

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));
				vi.mocked(fetch).mockClear();

				vi.mocked(fetch).mockResolvedValue({
					ok: false,
					json: () => Promise.resolve({})
				} as Response);

				const result = await stars.toggle('uuid-1');

				expect(result).toBe(false);
				expect(stars.isStarred('uuid-1')).toBe(false);
			});

			it('rolls back on API success false response', async () => {
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ modules: [], total: 0 })
				} as Response);

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));
				vi.mocked(fetch).mockClear();

				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ success: false })
				} as Response);

				const result = await stars.toggle('uuid-1');

				expect(result).toBe(false);
				expect(stars.isStarred('uuid-1')).toBe(false);
			});

			it('rolls back on network error', async () => {
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });

				vi.mocked(fetch)
					.mockResolvedValueOnce({
						ok: true,
						json: () => Promise.resolve({ modules: [], total: 0 })
					} as Response)
					.mockRejectedValueOnce(new Error('Network error'));

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));

				vi.spyOn(console, 'error').mockImplementation(() => {});

				const result = await stars.toggle('uuid-1');

				expect(result).toBe(false);
				expect(stars.isStarred('uuid-1')).toBe(false);
			});

			it('persists rollback state to localStorage', async () => {
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });

				vi.mocked(fetch)
					.mockResolvedValueOnce({
						ok: true,
						json: () => Promise.resolve({ modules: [], total: 0 })
					} as Response)
					.mockResolvedValueOnce({
						ok: false,
						json: () => Promise.resolve({})
					} as Response);

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));

				await stars.toggle('uuid-1');

				const stored = JSON.parse(localStorageMock.getItem('starred_modules') || '[]');
				expect(stored).not.toContain('uuid-1');
			});

			it('encodes module uuid with @ symbol correctly', async () => {
				const { stars } = await import('./stars.svelte');
				const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
				vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ modules: [], total: 0 })
				} as Response);

				stars.setAuthenticated(true);
				await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/stars'));
				vi.mocked(fetch).mockClear();

				vi.mocked(fetch).mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({ success: true })
				} as Response);

				await stars.toggle('cpu-monitor@system');

				expect(fetch).toHaveBeenCalledWith('/api/modules/cpu-monitor@system/star', {
					method: 'POST'
				});
			});
		});
	});

	describe('syncWithServer', () => {
		it('sets syncing to true during sync', async () => {
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });

			let resolveFetch: (value: Response) => void;
			vi.mocked(fetch).mockReturnValue(
				new Promise((resolve) => {
					resolveFetch = resolve;
				})
			);

			const syncPromise = stars.syncWithServer();
			expect(stars.syncing).toBe(true);

			resolveFetch!({
				ok: true,
				json: () => Promise.resolve({ modules: [], total: 0 })
			} as Response);

			await syncPromise;
			expect(stars.syncing).toBe(false);
		});

		it('merges server stars with local stars', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['local-uuid'])
			});
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({
				modules: [{ uuid: 'server-uuid' }],
				total: 1
			});
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [{ uuid: 'server-uuid' }], total: 1 })
			} as Response);

			await stars.syncWithServer();

			expect(stars.isStarred('local-uuid')).toBe(true);
			expect(stars.isStarred('server-uuid')).toBe(true);
		});

		it('persists merged stars to localStorage', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['local-uuid'])
			});
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({
				modules: [{ uuid: 'server-uuid' }],
				total: 1
			});
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [{ uuid: 'server-uuid' }], total: 1 })
			} as Response);

			await stars.syncWithServer();

			const stored = JSON.parse(localStorageMock.getItem('starred_modules') || '[]');
			expect(stored).toContain('local-uuid');
			expect(stored).toContain('server-uuid');
		});

		it('sets isAuthenticated to true on successful sync', async () => {
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [], total: 0 })
			} as Response);

			await stars.syncWithServer();

			expect(stars.isAuthenticated).toBe(true);
		});

		it('syncs local-only stars to server', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['local-only-uuid'])
			});
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({
				modules: [{ uuid: 'server-uuid' }],
				total: 1
			});
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [{ uuid: 'server-uuid' }], total: 1 })
			} as Response);

			await stars.syncWithServer();

			await vi.waitFor(() => {
				expect(fetch).toHaveBeenCalledWith('/api/modules/local-only-uuid/star', { method: 'POST' });
			});
		});

		it('removes module from local if server returns 404', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['deleted-uuid'])
			});
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({ modules: [], total: 0 });
			vi.mocked(fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ modules: [], total: 0 })
				} as Response)
				.mockResolvedValueOnce({
					ok: false,
					status: 404
				} as Response);

			await stars.syncWithServer();

			await vi.waitFor(() => {
				expect(stars.isStarred('deleted-uuid')).toBe(false);
			});
		});

		it('handles API errors gracefully', async () => {
			const { stars } = await import('./stars.svelte');
			vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
			vi.spyOn(console, 'error').mockImplementation(() => {});

			await stars.syncWithServer();

			expect(stars.syncing).toBe(false);
			expect(console.error).toHaveBeenCalled();
		});

		it('handles non-ok response gracefully', async () => {
			const { stars } = await import('./stars.svelte');
			vi.mocked(fetch).mockResolvedValue({
				ok: false,
				status: 500
			} as Response);

			await stars.syncWithServer();

			expect(stars.syncing).toBe(false);
			expect(stars.isAuthenticated).toBe(false);
		});

		it('does not sync modules that are already on server', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['server-uuid'])
			});
			const { stars } = await import('./stars.svelte');
			const { normalizeStarsPayload } = await import('$lib/utils/starsResponse');
			vi.mocked(normalizeStarsPayload).mockReturnValue({
				modules: [{ uuid: 'server-uuid' }],
				total: 1
			});
			vi.mocked(fetch).mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ modules: [{ uuid: 'server-uuid' }], total: 1 })
			} as Response);

			await stars.syncWithServer();

			expect(fetch).toHaveBeenCalledTimes(1);
			expect(fetch).toHaveBeenCalledWith('/api/stars');
		});
	});

	describe('starredUuids derived state', () => {
		it('returns array of starred UUIDs', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['uuid-1', 'uuid-2'])
			});
			const { stars } = await import('./stars.svelte');
			expect(stars.starredUuids).toEqual(expect.arrayContaining(['uuid-1', 'uuid-2']));
			expect(stars.starredUuids).toHaveLength(2);
		});

		it('returns empty array when no stars', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.starredUuids).toEqual([]);
		});

		it('updates when stars change', async () => {
			const { stars } = await import('./stars.svelte');
			expect(stars.starredUuids).toEqual([]);

			await stars.toggle('uuid-1');
			expect(stars.starredUuids).toContain('uuid-1');
		});
	});

	describe('clearLocalState', () => {
		it('clears starred data and storage', async () => {
			localStorageMock._setStore({
				starred_modules: JSON.stringify(['uuid-1'])
			});
			const { stars } = await import('./stars.svelte');

			stars.setStarCount('uuid-1', 2);
			stars.setAuthenticated(true);

			stars.clearLocalState();

			expect(stars.starredUuids).toEqual([]);
			expect(stars.getStarCount('uuid-1')).toBe(0);
			expect(stars.isAuthenticated).toBe(false);
			expect(localStorage.getItem('starred_modules')).toBeNull();
		});
	});
});

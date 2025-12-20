import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writable } from 'svelte/store';

const mockStarsStore = writable({ starred: new Set(['starred-uuid']), isAuthenticated: false });

vi.mock('$lib/stores/stars', () => ({
	stars: {
		subscribe: (fn: (value: unknown) => void) => mockStarsStore.subscribe(fn),
		setStarred: (uuids: string[]) =>
			mockStarsStore.set({ starred: new Set(uuids), isAuthenticated: false })
	}
}));

vi.mock('$lib/constants', () => ({
	getCategoryVariant: vi.fn((cat: string) => {
		const variants: Record<string, string> = {
			status: 'purple',
			utility: 'blue',
			media: 'green',
			system: 'orange'
		};
		return variants[cat.toLowerCase()] || 'neutral';
	}),
	getCategoryColor: vi.fn((cat: string) => {
		const colors: Record<string, string> = {
			status: '#8b5cf6',
			utility: '#3b82f6',
			media: '#22c55e',
			system: '#f97316'
		};
		return colors[cat.toLowerCase()] || '#6b7280';
	}),
	SEVEN_DAYS_MS: 7 * 24 * 60 * 60 * 1000
}));

describe('useModuleCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockStarsStore.set({ starred: new Set(['starred-uuid']), isAuthenticated: false });
	});

	describe('categoryVariant', () => {
		it('returns purple for status category', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({ uuid: 'test', category: 'status', createdAt: undefined });
			expect(result.categoryVariant).toBe('purple');
		});

		it('returns blue for utility category', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({ uuid: 'test', category: 'utility', createdAt: undefined });
			expect(result.categoryVariant).toBe('blue');
		});

		it('returns neutral for unknown category', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({ uuid: 'test', category: 'unknown', createdAt: undefined });
			expect(result.categoryVariant).toBe('neutral');
		});
	});

	describe('categoryColor', () => {
		it('returns correct hex color for status category', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({ uuid: 'test', category: 'status', createdAt: undefined });
			expect(result.categoryColor).toBe('#8b5cf6');
		});

		it('returns gray for unknown category', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({ uuid: 'test', category: 'unknown', createdAt: undefined });
			expect(result.categoryColor).toBe('#6b7280');
		});
	});

	describe('isNew', () => {
		it('returns true for modules created within 7 days', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const recentDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
			const result = useModuleCard({ uuid: 'test', category: 'status', createdAt: recentDate });
			expect(result.isNew).toBe(true);
		});

		it('returns false for modules older than 7 days', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();
			const result = useModuleCard({ uuid: 'test', category: 'status', createdAt: oldDate });
			expect(result.isNew).toBe(false);
		});

		it('returns false when createdAt is undefined', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({ uuid: 'test', category: 'status', createdAt: undefined });
			expect(result.isNew).toBe(false);
		});
	});

	describe('isStarred', () => {
		it('returns true for starred modules', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');
			const result = useModuleCard({
				uuid: 'starred-uuid',
				category: 'status',
				createdAt: undefined
			});
			expect(result.isStarred).toBe(true);
		});

		it('returns false for non-starred modules', async () => {
			const { useModuleCard } = await import('./useModuleCard.svelte');

			const result = useModuleCard({
				uuid: 'not-starred',

				category: 'status',

				createdAt: undefined
			});

			expect(result.isStarred).toBe(false);
		});
	});
});

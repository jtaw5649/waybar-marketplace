import { describe, it, expect } from 'vitest';
import { calculatePopularityScore, calculateTrendingScore } from './popularity';

describe('calculatePopularityScore', () => {
	describe('downloads contribution', () => {
		it('returns 0 for module with no downloads and no rating', () => {
			const score = calculatePopularityScore({
				downloads: 0,
				rating: null,
				created_at: new Date().toISOString()
			});
			expect(score).toBe(0);
		});

		it('increases score with more downloads (logarithmic scale)', () => {
			const score10 = calculatePopularityScore({
				downloads: 10,
				rating: null,
				created_at: new Date().toISOString()
			});
			const score100 = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: new Date().toISOString()
			});
			const score1000 = calculatePopularityScore({
				downloads: 1000,
				rating: null,
				created_at: new Date().toISOString()
			});

			expect(score100).toBeGreaterThan(score10);
			expect(score1000).toBeGreaterThan(score100);
			// Logarithmic: 10x downloads should not give 10x score
			expect(score100 / score10).toBeLessThan(5);
		});
	});

	describe('rating contribution', () => {
		it('boosts score for high-rated modules', () => {
			const baseDate = new Date().toISOString();
			const unrated = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: baseDate
			});
			const rated5 = calculatePopularityScore({
				downloads: 100,
				rating: 5,
				created_at: baseDate
			});

			expect(rated5).toBeGreaterThan(unrated);
		});

		it('penalizes low-rated modules', () => {
			const baseDate = new Date().toISOString();
			const rated1 = calculatePopularityScore({
				downloads: 100,
				rating: 1,
				created_at: baseDate
			});
			const rated5 = calculatePopularityScore({
				downloads: 100,
				rating: 5,
				created_at: baseDate
			});

			expect(rated5).toBeGreaterThan(rated1);
		});

		it('treats unrated modules neutrally (rating multiplier of 1)', () => {
			const baseDate = new Date().toISOString();
			const unrated = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: baseDate
			});
			const rated3 = calculatePopularityScore({
				downloads: 100,
				rating: 3,
				created_at: baseDate
			});

			// Rating of 3 (average) should be close to unrated
			expect(Math.abs(unrated - rated3)).toBeLessThan(unrated * 0.3);
		});
	});

	describe('recency contribution', () => {
		it('gives bonus to newer modules', () => {
			const now = new Date();
			const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const newModule = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: now.toISOString()
			});
			const weekOld = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: oneWeekAgo.toISOString()
			});
			const monthOld = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: oneMonthAgo.toISOString()
			});

			expect(newModule).toBeGreaterThan(weekOld);
			expect(weekOld).toBeGreaterThan(monthOld);
		});

		it('does not penalize old modules too heavily', () => {
			const now = new Date();
			const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

			const newModule = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: now.toISOString()
			});
			const oldModule = calculatePopularityScore({
				downloads: 100,
				rating: null,
				created_at: oneYearAgo.toISOString()
			});

			// Old module should still have significant score (at least 50% of new)
			expect(oldModule).toBeGreaterThan(newModule * 0.5);
		});
	});

	describe('combined scoring', () => {
		it('high downloads + high rating outscores low downloads', () => {
			const baseDate = new Date().toISOString();
			const popular = calculatePopularityScore({
				downloads: 1000,
				rating: 4.5,
				created_at: baseDate
			});
			const unpopular = calculatePopularityScore({
				downloads: 10,
				rating: 5,
				created_at: baseDate
			});

			expect(popular).toBeGreaterThan(unpopular);
		});

		it('handles edge case of 0 downloads gracefully', () => {
			const score = calculatePopularityScore({
				downloads: 0,
				rating: 5,
				created_at: new Date().toISOString()
			});

			expect(score).toBeGreaterThanOrEqual(0);
			expect(Number.isFinite(score)).toBe(true);
		});
	});
});

describe('calculateTrendingScore', () => {
	it('weights recency more heavily than popularity score', () => {
		const now = new Date();
		const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const newLowDownloads = calculateTrendingScore({
			downloads: 50,
			rating: null,
			created_at: now.toISOString()
		});
		const oldHighDownloads = calculateTrendingScore({
			downloads: 500,
			rating: null,
			created_at: oneWeekAgo.toISOString()
		});

		// New module with fewer downloads can beat older popular one in trending
		expect(newLowDownloads).toBeGreaterThan(oldHighDownloads * 0.5);
	});

	it('returns higher scores for recent modules', () => {
		const now = new Date();
		const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const todayScore = calculateTrendingScore({
			downloads: 100,
			rating: null,
			created_at: now.toISOString()
		});
		const yesterdayScore = calculateTrendingScore({
			downloads: 100,
			rating: null,
			created_at: yesterday.toISOString()
		});
		const weekScore = calculateTrendingScore({
			downloads: 100,
			rating: null,
			created_at: lastWeek.toISOString()
		});

		expect(todayScore).toBeGreaterThan(yesterdayScore);
		expect(yesterdayScore).toBeGreaterThan(weekScore);
	});

	it('still considers downloads as a factor', () => {
		const baseDate = new Date().toISOString();
		const manyDownloads = calculateTrendingScore({
			downloads: 1000,
			rating: null,
			created_at: baseDate
		});
		const fewDownloads = calculateTrendingScore({
			downloads: 10,
			rating: null,
			created_at: baseDate
		});

		expect(manyDownloads).toBeGreaterThan(fewDownloads);
	});
});

/**
 * Module data required for popularity calculations.
 */
export interface ModuleMetrics {
	downloads: number;
	rating: number | null;
	last_updated?: string | null;
}

/**
 * Calculates a popularity score combining downloads, rating, and recency.
 *
 * Formula:
 * - Base: log10(downloads + 1) * 10 (logarithmic scale to prevent runaway scores)
 * - Rating multiplier: 0.7 to 1.3 based on rating (neutral for unrated)
 * - Recency bonus: 1.0 to 1.5 based on age (decays over 90 days)
 *
 * @param module - Module metrics for calculation
 * @returns Popularity score (higher is more popular)
 */
export function calculatePopularityScore(module: ModuleMetrics): number {
	const downloadScore = calculateDownloadScore(module.downloads);
	const ratingMultiplier = calculateRatingMultiplier(module.rating);
	const recencyBonus = calculateRecencyBonus(module.last_updated);

	return downloadScore * ratingMultiplier * recencyBonus;
}

/**
 * Calculates a trending score that weights recency more heavily.
 *
 * Similar to popularity but with stronger time decay - good modules
 * from the past week will rank higher than older popular modules.
 *
 * @param module - Module metrics for calculation
 * @returns Trending score (higher is more trending)
 */
export function calculateTrendingScore(module: ModuleMetrics): number {
	const downloadScore = calculateDownloadScore(module.downloads);
	const ratingMultiplier = calculateRatingMultiplier(module.rating);
	const trendingBonus = calculateTrendingBonus(module.last_updated);

	return downloadScore * ratingMultiplier * trendingBonus;
}

function calculateDownloadScore(downloads: number): number {
	if (downloads <= 0) return 0;
	return Math.log10(downloads + 1) * 10;
}

function calculateRatingMultiplier(rating: number | null): number {
	if (rating === null) return 1.0;

	return 0.7 + (rating - 1) * 0.15;
}

function calculateRecencyBonus(lastUpdated?: string | null): number {
	if (!lastUpdated) return 1.0;

	const ageInDays = getAgeInDays(lastUpdated);

	const decayDays = 90;
	const maxBonus = 0.5;

	if (!Number.isFinite(ageInDays) || ageInDays >= decayDays) return 1.0;

	const decayFactor = 1 - ageInDays / decayDays;
	return 1.0 + maxBonus * decayFactor;
}

function calculateTrendingBonus(lastUpdated?: string | null): number {
	if (!lastUpdated) return 1.0;

	const ageInDays = getAgeInDays(lastUpdated);

	const halfLife = 7;
	const maxMultiplier = 3.0;
	const minMultiplier = 0.5;

	if (!Number.isFinite(ageInDays)) return 1.0;

	const decay = Math.pow(0.5, ageInDays / halfLife);
	return minMultiplier + (maxMultiplier - minMultiplier) * decay;
}

function getAgeInDays(lastUpdated: string): number {
	const created = new Date(lastUpdated).getTime();
	const now = Date.now();
	const ageMs = now - created;
	return Math.max(0, ageMs / (24 * 60 * 60 * 1000));
}

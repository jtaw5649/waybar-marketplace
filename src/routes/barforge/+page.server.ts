import { privateCacheHeaders } from '$lib/server/cacheHeaders';
import type { PageServerLoad } from './$types';

interface GitHubRepo {
	stargazers_count: number;
	forks_count: number;
}

interface GitHubContributor {
	login: string;
}

interface EcosystemStats {
	stars: number;
	forks: number;
	contributors: number;
}

async function fetchRepoStats(
	fetch: typeof globalThis.fetch,
	repo: string
): Promise<GitHubRepo | null> {
	const response = await fetch(`https://api.github.com/repos/jtaw5649/${repo}`, {
		headers: { Accept: 'application/vnd.github.v3+json' }
	});
	if (!response.ok) return null;
	return response.json();
}

async function fetchContributors(
	fetch: typeof globalThis.fetch,
	repo: string
): Promise<GitHubContributor[]> {
	const response = await fetch(`https://api.github.com/repos/jtaw5649/${repo}/contributors`, {
		headers: { Accept: 'application/vnd.github.v3+json' }
	});
	if (!response.ok) return [];
	return response.json();
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	setHeaders(privateCacheHeaders);

	const [webRepo, appRepo, webContributors, appContributors] = await Promise.all([
		fetchRepoStats(fetch, 'barforge-web'),
		fetchRepoStats(fetch, 'barforge-app'),
		fetchContributors(fetch, 'barforge-web'),
		fetchContributors(fetch, 'barforge-app')
	]);

	const uniqueContributors = new Set([
		...webContributors.map((c) => c.login),
		...appContributors.map((c) => c.login)
	]);

	const stats: EcosystemStats = {
		stars: (webRepo?.stargazers_count ?? 0) + (appRepo?.stargazers_count ?? 0),
		forks: (webRepo?.forks_count ?? 0) + (appRepo?.forks_count ?? 0),
		contributors: uniqueContributors.size
	};

	return { stats };
};

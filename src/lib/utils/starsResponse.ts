export type StarsPayload<T> = {
	modules: T[];
	total: number;
};

export function normalizeStarsPayload<T>(payload: unknown): StarsPayload<T> {
	const empty: StarsPayload<T> = { modules: [], total: 0 };
	if (!payload || typeof payload !== 'object') return empty;
	const root = payload as Record<string, unknown>;
	const data =
		root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null;
	const modules = (data?.modules ?? root.modules) as unknown;
	const total = (data?.total ?? root.total) as unknown;

	return {
		modules: Array.isArray(modules) ? (modules as T[]) : [],
		total: typeof total === 'number' ? total : 0
	};
}

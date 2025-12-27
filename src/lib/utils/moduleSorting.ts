import type { Module } from '$lib/types';

export function sortModulesByScore(
	modules: Module[],
	scoreFor: (module: Module) => number
): Module[] {
	const scored = modules.map((module) => ({
		module,
		score: scoreFor(module)
	}));

	scored.sort((a, b) => b.score - a.score);

	return scored.map((entry) => entry.module);
}

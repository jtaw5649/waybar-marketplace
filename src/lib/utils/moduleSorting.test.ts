import { describe, expect, it, vi } from 'vitest';
import type { Module } from '$lib/types';
import { sortModulesByScore } from './moduleSorting';

describe('sortModulesByScore', () => {
	it('sorts modules by score and evaluates each once', () => {
		const modules = [
			{ uuid: 'a', name: 'Alpha' } as Module,
			{ uuid: 'b', name: 'Beta' } as Module,
			{ uuid: 'c', name: 'Gamma' } as Module
		];
		const scoreFor = vi.fn((module: Module) => {
			if (module.uuid === 'a') return 10;
			if (module.uuid === 'b') return 5;
			return 20;
		});

		const sorted = sortModulesByScore(modules, scoreFor);

		expect(scoreFor).toHaveBeenCalledTimes(modules.length);
		expect(sorted.map((module) => module.uuid)).toEqual(['c', 'a', 'b']);
	});
});

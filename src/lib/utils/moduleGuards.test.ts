import { describe, it, expect } from 'vitest';
import {
	isRegistryModule,
	isStarredModule,
	validateModule,
	validateModules,
	validateStarredModule,
	validateStarredModules,
	ModuleValidationError
} from './moduleGuards';

const validModule = {
	uuid: 'test-uuid',
	name: 'test-module',
	repo_url: 'https://github.com/test/repo',
	tags: ['tag1', 'tag2'],
	author: 'testuser',
	description: 'A test module',
	category: 'utility',
	downloads: 100,
	version: '1.0.0'
};

const validStarredModule = {
	...validModule,
	starred_at: '2024-01-01T00:00:00Z'
};

describe('isRegistryModule', () => {
	it('returns true for valid module', () => {
		expect(isRegistryModule(validModule)).toBe(true);
	});

	it('returns false for null', () => {
		expect(isRegistryModule(null)).toBe(false);
	});

	it('returns false for missing uuid', () => {
		const { uuid: _uuid, ...rest } = validModule;
		expect(isRegistryModule(rest)).toBe(false);
	});

	it('returns false for missing name', () => {
		const { name: _name, ...rest } = validModule;
		expect(isRegistryModule(rest)).toBe(false);
	});

	it('returns false for missing repo_url', () => {
		const { repo_url: _repo_url, ...rest } = validModule;
		expect(isRegistryModule(rest)).toBe(false);
	});

	it('returns false for missing tags', () => {
		const { tags: _tags, ...rest } = validModule;
		expect(isRegistryModule(rest)).toBe(false);
	});

	it('returns false for non-string-array tags', () => {
		expect(isRegistryModule({ ...validModule, tags: [1, 2, 3] })).toBe(false);
	});
});

describe('isStarredModule', () => {
	it('returns true for valid starred module', () => {
		expect(isStarredModule(validStarredModule)).toBe(true);
	});

	it('returns false for module without starred_at', () => {
		expect(isStarredModule(validModule)).toBe(false);
	});
});

describe('validateModule', () => {
	it('returns the module when valid', () => {
		expect(validateModule(validModule)).toEqual(validModule);
	});

	it('throws ModuleValidationError for invalid data', () => {
		expect(() => validateModule(null)).toThrow(ModuleValidationError);
	});

	it('includes context in error message', () => {
		expect(() => validateModule(null, 'test context')).toThrow(/test context/);
	});

	it('includes the invalid data in the error', () => {
		try {
			validateModule({ bad: 'data' });
		} catch (e) {
			expect(e).toBeInstanceOf(ModuleValidationError);
			expect((e as ModuleValidationError).data).toEqual({ bad: 'data' });
		}
	});
});

describe('validateModules', () => {
	it('returns array of modules when all valid', () => {
		const modules = [validModule, { ...validModule, uuid: 'other-uuid' }];
		expect(validateModules(modules)).toEqual(modules);
	});

	it('throws for non-array input', () => {
		expect(() => validateModules('not an array')).toThrow(ModuleValidationError);
	});

	it('throws for array with invalid module', () => {
		const modules = [validModule, { bad: 'data' }];
		expect(() => validateModules(modules)).toThrow(ModuleValidationError);
	});

	it('includes index in error for invalid item', () => {
		const modules = [validModule, { bad: 'data' }];
		expect(() => validateModules(modules, 'modules')).toThrow(/modules\[1\]/);
	});
});

describe('validateStarredModule', () => {
	it('returns the starred module when valid', () => {
		expect(validateStarredModule(validStarredModule)).toEqual(validStarredModule);
	});

	it('throws for module without starred_at', () => {
		expect(() => validateStarredModule(validModule)).toThrow(ModuleValidationError);
	});
});

describe('validateStarredModules', () => {
	it('returns array of starred modules when all valid', () => {
		const modules = [validStarredModule, { ...validStarredModule, uuid: 'other-uuid' }];
		expect(validateStarredModules(modules)).toEqual(modules);
	});

	it('throws for non-array input', () => {
		expect(() => validateStarredModules('not an array')).toThrow(ModuleValidationError);
	});
});

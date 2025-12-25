import { describe, it, expect } from 'vitest';
import { encodeModuleUuid } from './url';

describe('encodeModuleUuid', () => {
	it('keeps @ in the output', () => {
		expect(encodeModuleUuid('cpu@system')).toBe('cpu@system');
	});

	it('encodes spaces and special characters', () => {
		expect(encodeModuleUuid('cpu temp@system')).toBe('cpu%20temp@system');
		expect(encodeModuleUuid('cpu#temp@system')).toBe('cpu%23temp@system');
	});
});

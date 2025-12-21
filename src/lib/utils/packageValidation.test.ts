import { describe, it, expect } from 'vitest';
import {
	ALLOWED_PACKAGE_EXTENSIONS,
	MAX_PACKAGE_BYTES,
	isAllowedPackageExtension,
	isPackageSizeAllowed
} from './packageValidation';

describe('package validation', () => {
	it('allows tar.gz and tgz extensions', () => {
		expect(isAllowedPackageExtension('module.tar.gz')).toBe(true);
		expect(isAllowedPackageExtension('module.tgz')).toBe(true);
		expect(isAllowedPackageExtension('module.zip')).toBe(false);
	});

	it('exposes allowed extensions', () => {
		expect(ALLOWED_PACKAGE_EXTENSIONS).toContain('.tar.gz');
		expect(ALLOWED_PACKAGE_EXTENSIONS).toContain('.tgz');
	});

	it('validates package size limits', () => {
		expect(isPackageSizeAllowed(MAX_PACKAGE_BYTES)).toBe(true);
		expect(isPackageSizeAllowed(MAX_PACKAGE_BYTES + 1)).toBe(false);
	});
});

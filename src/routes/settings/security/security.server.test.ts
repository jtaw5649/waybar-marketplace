// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('Security server actions', () => {
	it('exports exportData action', async () => {
		const { actions } = await import('./+page.server');
		expect(actions).toBeDefined();
		expect(actions.exportData).toBeDefined();
		expect(typeof actions.exportData).toBe('function');
	});
});

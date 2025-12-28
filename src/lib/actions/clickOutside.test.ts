// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { clickOutside } from './clickOutside';

describe('clickOutside action', () => {
	it('invokes handler when clicking outside the node', () => {
		const node = document.createElement('div');
		document.body.appendChild(node);
		const handler = vi.fn();

		const action = clickOutside(node, { handler });
		document.body.click();

		expect(handler).toHaveBeenCalledOnce();

		action.destroy();
		node.remove();
	});

	it('does not invoke handler when clicking inside the node', () => {
		const node = document.createElement('div');
		const child = document.createElement('span');
		node.appendChild(child);
		document.body.appendChild(node);
		const handler = vi.fn();

		const action = clickOutside(node, { handler });
		child.click();

		expect(handler).not.toHaveBeenCalled();

		action.destroy();
		node.remove();
	});

	it('ignores clicks on provided ignore elements', () => {
		const node = document.createElement('div');
		const ignore = document.createElement('button');
		document.body.appendChild(node);
		document.body.appendChild(ignore);
		const handler = vi.fn();

		const action = clickOutside(node, { handler, ignore: [ignore] });
		ignore.click();

		expect(handler).not.toHaveBeenCalled();

		action.destroy();
		node.remove();
		ignore.remove();
	});
});

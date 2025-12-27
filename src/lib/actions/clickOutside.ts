type ClickOutsideParams = {
	handler: (event: MouseEvent) => void;
	ignore?: Array<HTMLElement | null>;
};

export const clickOutside = (node: HTMLElement, params: ClickOutsideParams) => {
	let current = params;

	const handleClick = (event: MouseEvent) => {
		const target = event.target as Node | null;
		if (!target || node.contains(target)) return;
		if (current.ignore?.some((ignore) => ignore && ignore.contains(target))) return;
		current.handler(event);
	};

	document.addEventListener('click', handleClick);

	return {
		update(next: ClickOutsideParams) {
			current = next;
		},
		destroy() {
			document.removeEventListener('click', handleClick);
		}
	};
};

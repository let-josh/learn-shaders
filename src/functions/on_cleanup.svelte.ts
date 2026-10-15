export const on_cleanup = (fn: () => void) => {
	$effect(() => {
		return () => {
			fn();
		};
	});
};

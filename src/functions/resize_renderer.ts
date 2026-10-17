import type * as three from "three/webgpu";
import { devicePixelRatio } from "svelte/reactivity/window";

const resize_renderer = (
	renderer: three.Renderer,
	width: number,
	height: number,
	update_style = false,
) => {
	const dpr = devicePixelRatio.current ?? 1;
	renderer.setSize(
		Math.floor(width * dpr),
		Math.floor(height * dpr),
		update_style,
	);
};

export { resize_renderer };

import type * as three from "three/webgpu";
import { devicePixelRatio } from "svelte/reactivity/window";

const resize_renderer = (
	renderer: three.Renderer,
	width: number,
	height: number,
	update_style = false,
) => {
	const dpr = devicePixelRatio.current ?? 1;
	width = Math.round(width * dpr);
	height = Math.round(height * dpr);
	renderer.setSize(width, height, update_style);
};

export { resize_renderer };

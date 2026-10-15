import type * as three from "three/webgpu";
import { devicePixelRatio } from "svelte/reactivity/window";

const content_box_size_resize = (
	renderer: three.Renderer,
	size: ResizeObserverSize,
) => {
	const dpr = devicePixelRatio.current ?? 1;
	const width = Math.round(size.inlineSize * dpr);
	const height = Math.round(size.blockSize * dpr);
	renderer.setSize(width, height, false);
};

const canvas_client_size_resize = (renderer: three.Renderer) => {
	const canvas = renderer.domElement;
	const dpr = devicePixelRatio.current ?? 1;
	const width = Math.round(canvas.clientWidth * dpr);
	const height = Math.round(canvas.clientHeight * dpr);
	renderer.setSize(width, height, false);
};

export { content_box_size_resize, canvas_client_size_resize };

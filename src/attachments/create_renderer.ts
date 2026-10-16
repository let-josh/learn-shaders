import type * as three from "three/webgpu";
import type { Attachment } from "svelte/attachments";
import { WebGPURenderer } from "three/webgpu";

const create_renderer =
	(
		callback?: (renderer: three.Renderer) => void | (() => void),
	): Attachment<HTMLCanvasElement> =>
	(canvas) => {
		const init_renderer = new WebGPURenderer({
			canvas,
		})
			.init()
			.then((renderer) => {
				const cleanup = callback?.(renderer);
				return () => {
					cleanup?.();
					renderer.dispose();
				};
			});

		return () => {
			init_renderer.then((cleanup) => cleanup());
		};
	};

export { create_renderer };

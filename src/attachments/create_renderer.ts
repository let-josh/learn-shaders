import type * as three from "three/webgpu";
import type { Attachment } from "svelte/attachments";
import type { RendererContext } from "@/classes/renderer_context";
import { WebGPURenderer } from "three/webgpu";
import { canvas_client_size_resize } from "@/functions/resize_renderer";

const create_renderer =
	(
		context: RendererContext,
		callback?: (renderer: three.Renderer) => void,
	): Attachment<HTMLCanvasElement> =>
	(canvas) => {
		const init_renderer = new WebGPURenderer({
			canvas,
		})
			.init()
			.then((renderer) => {
				canvas_client_size_resize(renderer);
				callback?.(renderer);
				context.renderer = renderer;
				return () => {
					context.renderer = null;
					renderer.dispose();
				};
			});

		return () => {
			init_renderer.then((cleanup) => cleanup());
		};
	};

export { create_renderer };

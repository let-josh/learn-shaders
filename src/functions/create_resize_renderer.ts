import type * as three from "three/webgpu";
import type { RendererContext } from "@/classes/renderer_context";
import { content_box_size_resize } from "@/functions/resize_renderer";

const create_resize_renderer =
	(context: RendererContext, callback?: (renderer: three.Renderer) => void) =>
	([size]: ResizeObserverSize[]) => {
		context.if_renderer((renderer) => {
			content_box_size_resize(renderer, size);
			callback?.(renderer);
		});
	};

export { create_resize_renderer };

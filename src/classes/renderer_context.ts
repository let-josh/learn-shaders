import type * as three from "three/webgpu";

class RendererContext {
	renderer: three.Renderer | null = null;
	if_renderer(
		callback: (renderer: NonNullable<RendererContext["renderer"]>) => void,
	) {
		if (this.renderer === null) return;
		callback(this.renderer);
	}
}

export { RendererContext };

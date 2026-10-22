import type * as three from "three/webgpu";

class Context {
	renderer: three.Renderer | null = null;
	if_renderer(callback: (renderer: NonNullable<Context["renderer"]>) => void) {
		if (this.renderer === null) return;
		callback(this.renderer);
	}
}

export { Context };

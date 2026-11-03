<script lang="ts">
	import * as three from "three/webgpu";
	import { Context } from "@/classes/renderer_context";
	import { range_input } from "@/components/controls.svelte";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform, uv } from "three/tsl";

	const scale = uniform(50);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: uv()
			.mul(scale.remap(0, 100, 1, 10))
			.fract(),
	});
	const quad = new three.QuadMesh(material);

	const context = new Context();
</script>

<div class="relative">
	<fieldset class="controls">
		{@render range_input(
			"scale",
			() => scale.value,
			(value) => {
				scale.value = value;
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
	</fieldset>

	<canvas
		class="aspect-square w-full"
		bind:contentBoxSize={
			null,
			([size]: ResizeObserverSize[]) => {
				context.if_renderer((renderer) => {
					resize_renderer(renderer, size.inlineSize, size.blockSize);
					quad.render(renderer);
				});
			}
		}
		{@attach (canvas) => {
			const init_renderer = new three.WebGPURenderer({
				canvas,
			})
				.init()
				.then((renderer) => {
					resize_renderer(
						renderer,
						renderer.domElement.clientWidth,
						renderer.domElement.clientHeight,
					);
					quad.render(renderer);

					const last = context.renderer;
					context.renderer = renderer;
					return () => {
						context.renderer = last;
						renderer.dispose();
					};
				});
			return () => {
				init_renderer.then((cleanup) => {
					cleanup();
				});
			};
		}}
	>
	</canvas>
</div>

<script lang="ts">
	import * as three from "three/webgpu";
	import { color_input } from "@/components/controls.svelte";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform } from "three/tsl";
	import { Context } from "@/classes/renderer_context";

	const colorNode = uniform(new three.Color("#d8a521"));

	const material = new three.MeshBasicNodeMaterial({
		colorNode,
	});

	const context = new Context();

	const quad = new three.QuadMesh(material);
</script>

<div class="relative">
	<fieldset class="controls">
		{@render color_input(
			"color",
			() => `#${colorNode.value.getHexString()}`,
			(value) => {
				colorNode.value.set(value);
				context.if_renderer((renderer) => {
					quad.render(renderer);
				});
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

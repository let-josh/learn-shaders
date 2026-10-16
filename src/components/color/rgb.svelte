<script lang="ts">
	import * as three from "three/webgpu";
	import { Color } from "@/classes/controls/index";
	import { RendererContext } from "@/classes/renderer_context";
	import { color_input } from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";

	const color = new Color("#d8a521");

	const material = new three.MeshBasicNodeMaterial({
		colorNode: color.node,
	});

	const quad = new three.QuadMesh(material);

	const context = new RendererContext();

	const render = (renderer: three.Renderer) => quad.render(renderer);
</script>

<div class="relative">
	<fieldset class="controls">
		{@render color_input(
			"color",
			() => color.value,
			(value) => {
				color.update(value);
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={
			null,
			([size]: ResizeObserverSize[]) => {
				context.if_renderer((renderer) => {
					resize_renderer(renderer, size.inlineSize, size.blockSize);
					render(renderer);
				});
			}
		}
		{@attach create_renderer((renderer) => {
			render(renderer);
			const canvas = renderer.domElement;
			resize_renderer(renderer, canvas.clientWidth, canvas.clientHeight);
			const last = context.renderer;
			context.renderer = renderer;
			return () => {
				context.renderer = last;
			};
		})}
	>
	</canvas>
</div>

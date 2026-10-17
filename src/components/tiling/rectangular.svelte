<script lang="ts" module>
	const count_range = new Range({
		min: 1,
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import { Uint } from "@/classes/controls/";
	import { create_renderer } from "@/attachments/create_renderer";
	import { range_input } from "@/components/controls.svelte";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uv } from "three/tsl";

	const count = new Uint(Math.floor(count_range.midpoint));

	const material = new three.MeshBasicNodeMaterial({
		colorNode: uv().mul(count.node).fract(),
	});
	const quad = new three.QuadMesh(material);

	const render = (renderer: three.Renderer) => quad.render(renderer);

	const resize_and_render = (
		renderer: three.Renderer,
		width: number,
		height: number,
	) => {
		resize_renderer(renderer, width, height);
		render(renderer);
	};

	const context = new RendererContext();
</script>

<div class="relative">
	<fieldset class="controls">
		{@render range_input(
			"count",
			() => count.value,
			(value) => {
				count.update(value);
				context.if_renderer((renderer) => quad.render(renderer));
			},
			count_range,
		)}
	</fieldset>

	<canvas
		class="aspect-square w-full"
		bind:contentBoxSize={
			null,
			([size]: ResizeObserverSize[]) => {
				context.if_renderer((renderer) =>
					resize_and_render(renderer, size.inlineSize, size.blockSize),
				);
			}
		}
		{@attach create_renderer((renderer) => {
			const canvas = renderer.domElement;
			resize_and_render(renderer, canvas.clientWidth, canvas.clientHeight);
			const last = context.renderer;
			context.renderer = renderer;
			return () => {
				context.renderer = last;
			};
		})}
	>
	</canvas>
</div>

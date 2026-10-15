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
	import { create_resize_renderer } from "@/functions/create_resize_renderer";
	import { range_input } from "@/components/controls.svelte";
	import { uv } from "three/tsl";

	const count = new Uint(Math.floor(count_range.midpoint));

	const material = new three.MeshBasicNodeMaterial({
		colorNode: uv().mul(count.node).fract(),
	});
	const quad = new three.QuadMesh(material);

	const render = (renderer: three.Renderer) => quad.render(renderer);

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
		class="aspect-square"
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

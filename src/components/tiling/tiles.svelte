<script lang="ts" module>
	const tile_count_range = new Range({
		min: 1,
		max: 10,
	});

	const blue_range = new Range({
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Float, Uint } from "@/classes/controls/index";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import { create_renderer } from "@/attachments/create_renderer";
	import { create_resize_renderer } from "@/functions/create_resize_renderer";
	import { range_input } from "@/components/controls.svelte";
	import { uv, vec3 } from "three/tsl";

	const tile_count = new Uint(Math.floor(tile_count_range.midpoint));
	const blue = new Float(blue_range.midpoint);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: vec3(
			uv().mul(tile_count.node).floor().div(tile_count.node),
			blue.node.remap(blue_range.min, blue_range.max, 0, 1),
		),
	});
	const quad = new three.QuadMesh(material);

	const context = new RendererContext();

	const render = (renderer: three.Renderer) => quad.render(renderer);

	const update =
		<T,>(update: (value: T) => void) =>
		(value: T) => {
			update(value);
			context.if_renderer((renderer) => quad.render(renderer));
		};
</script>

<div class="relative">
	<fieldset class="controls">
		{@render range_input(
			"tile count",
			() => tile_count.value,
			update((value) => tile_count.update(value)),
			tile_count_range,
		)}
		{@render range_input(
			"blue",
			() => blue.value,
			update((value) => blue.update(value)),
			blue_range,
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

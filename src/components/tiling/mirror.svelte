<script lang="ts" module>
	const tile_count_range = new Range({
		min: 1,
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Bool, Uint } from "@/classes/controls/index";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import { checkbox_input, range_input } from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { create_resize_renderer } from "@/functions/create_resize_renderer";
	import { uv } from "three/tsl";

	const tile_count = new Uint(Math.floor(tile_count_range.midpoint));
	const mirror = new Bool(true);

	const p = uv().mul(tile_count.node);
	const mirrored = p.mul(0.5).add(1).fract().mul(2).sub(1).abs();

	const material = new three.MeshBasicNodeMaterial({
		colorNode: mirror.node.select(mirrored, p.fract()),
	});
	const quad = new three.QuadMesh(material);

	const context = new RendererContext();

	const render = (renderer: three.Renderer) => quad.render(renderer);

	const update =
		<T,>(update: (value: T) => void) =>
		(value: T) => {
			update(value);
			context.if_renderer(render);
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
		{@render checkbox_input(
			"mirror",
			() => mirror.value,
			update((value) => mirror.update(value)),
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

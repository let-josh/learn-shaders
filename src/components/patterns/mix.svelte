<script lang="ts" module>
	const frequency_range = new Range({
		min: 1,
		max: 32,
	});

	const edge_range = new Range({
		max: 10,
	});

	const mix_range = new Range({
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Range } from "@/classes/range";
	import { Color, Float, Uint } from "@/classes/controls";
	import { RendererContext } from "@/classes/renderer_context";
	import { color_input, range_input } from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { create_resize_renderer } from "@/functions/create_resize_renderer";
	import { screenSize, uv } from "three/tsl";

	const aspect = screenSize.div(screenSize.x.min(screenSize.y));

	const transformed_uv = uv().sub(0.5).mul(aspect);

	const frequency = new Uint(Math.floor(frequency_range.midpoint));
	const edge = new Float(edge_range.midpoint);
	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const mix = new Float(mix_range.midpoint);

	const rings = transformed_uv.length().mul(frequency.node).sin();

	const burst = transformed_uv.y
		.atan(transformed_uv.x)
		.mul(frequency.node)
		.sin();

	const material = new three.MeshBasicNodeMaterial({
		colorNode: mix.node
			.remap(mix_range.min, mix_range.max, 0, 1)
			.mix(rings, burst)
			.step(edge.node.remap(edge_range.min, edge_range.max, -1, 1))
			.mix(color_a.node, color_b.node),
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
			"frequency",
			() => frequency.value,
			update((value) => frequency.update(value)),
			frequency_range,
		)}
		{@render range_input(
			"edge",
			() => edge.value,
			update((value) => edge.update(value)),
			edge_range,
		)}
		{@render range_input(
			"mix",
			() => mix.value,
			update((value) => mix.update(value)),
			mix_range,
		)}
		{@render color_input(
			"color a",
			() => color_a.value,
			update((value) => color_a.update(value)),
		)}
		{@render color_input(
			"color b",
			() => color_b.value,
			update((value) => color_b.update(value)),
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

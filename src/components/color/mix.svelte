<script module lang="ts">
	const t_range = new Range({ max: 10 });
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Color, Float } from "@/classes/controls/index";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import { color_input, range_input } from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { create_resize_renderer } from "@/functions/create_resize_renderer";

	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const t = new Float(t_range.midpoint);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: t.node
			.remap(t_range.min, t_range.max, 0, 1)
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
		{@render range_input(
			"t",
			() => t.value,
			update((value) => t.update(value)),
			t_range,
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

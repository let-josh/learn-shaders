<script lang="ts" module>
	const steps_range = new Range({
		min: 1 << 4,
		max: 1 << 7,
	});

	const t_range = new Range({
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Bool, Color, Float, Uint } from "@/classes/controls/index";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { create_resize_renderer } from "@/functions/create_resize_renderer";
	import { posterize, uv } from "three/tsl";

	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const use_posterize = new Bool(true);

	const t = new Float(t_range.midpoint);
	const steps = new Uint(Math.floor(steps_range.midpoint));

	const _uv = uv();
	const color = t.node
		.remap(t_range.min, t_range.max, 0, 1)
		.mix(_uv.x, _uv.y)
		.mix(color_a.node, color_b.node);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: use_posterize.node.select(posterize(color, steps.node), color),
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
		{@render range_input(
			"steps",
			() => steps.value,
			update((value) => steps.update(value)),
			steps_range,
		)}
		{@render checkbox_input(
			"posterize",
			() => use_posterize.value,
			update((value) => use_posterize.update(value)),
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

<script lang="ts" module>
	const degrees_range = new Range({
		max: 360,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Bool, Color, Float } from "@/classes/controls/index";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import { TWO_PI, rotateUV, uv } from "three/tsl";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";

	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const degrees = new Float(45);
	const saturate = new Bool(false);

	const radians = degrees.node.remap(
		degrees_range.min,
		degrees_range.max,
		0,
		TWO_PI,
	);

	const rx = rotateUV(uv(), radians).x;

	const t = saturate.node.select(rx.saturate(), rx);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: t.mix(color_a.node, color_b.node),
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
			"degrees",
			() => degrees.value,
			update((value) => degrees.update(value)),
			degrees_range,
		)}
		{@render checkbox_input(
			"saturate",
			() => saturate.value,
			update((value) => saturate.update(value)),
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

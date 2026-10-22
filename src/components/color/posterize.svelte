<script lang="ts">
	import * as three from "three/webgpu";
	import { Bool, Color, Float } from "@/classes/controls/index";
	import { Context } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { posterize, uv } from "three/tsl";
	import { resize_renderer } from "@/functions/resize_renderer";

	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const use_posterize = new Bool(true);

	const t = new Float(50);
	const steps = new Float(50);

	const _uv = uv();
	const color = t.node
		.remap(0, 100, 0, 1)
		.mix(_uv.x, _uv.y)
		.mix(color_a.node, color_b.node);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: use_posterize.node.select(
			posterize(color, steps.node.remap(0, 100, 1 << 4, 1 << 7).floor()),
			color,
		),
	});

	const quad = new three.QuadMesh(material);

	const context = new Context();

	const render = (renderer: three.Renderer) => quad.render(renderer);

	const update = (callback: () => void) => {
		callback();
		context.if_renderer(render);
	};
</script>

<div class="relative">
	<fieldset class="controls">
		{@render color_input(
			"color a",
			() => color_a.value,
			(value) => update(() => color_a.update(value)),
		)}
		{@render color_input(
			"color b",
			() => color_b.value,
			(value) => update(() => color_b.update(value)),
		)}
		{@render range_input(
			"t",
			() => t.value,
			(value) => update(() => t.update(value)),
		)}
		{@render range_input(
			"steps",
			() => steps.value,
			(value) => update(() => steps.update(value)),
		)}
		{@render checkbox_input(
			"posterize",
			() => use_posterize.value,
			(value) => update(() => use_posterize.update(value)),
		)}
	</fieldset>

	<canvas
		class="aspect-square w-full"
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
			const canvas = renderer.domElement;
			resize_renderer(renderer, canvas.clientWidth, canvas.clientHeight);
			render(renderer);
			const last = context.renderer;
			context.renderer = renderer;
			return () => {
				context.renderer = last;
			};
		})}
	>
	</canvas>
</div>

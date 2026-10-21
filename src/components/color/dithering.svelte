<script lang="ts">
	import * as three from "three/webgpu";
	import { Bool, Color, Float } from "@/classes/controls/index";
	import { RendererContext } from "@/classes/renderer_context";
	import { bayerDither } from "three/addons/tsl/math/Bayer.js";
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
	const t = new Float(50);
	const steps = new Float(50);
	const dither = new Bool(true);

	const _uv = uv();
	const color = t.node
		.remap(0, 100, 0, 1)
		.mix(_uv.x, _uv.y)
		.mix(color_a.node, color_b.node);

	const steps_remapped = steps.node.remap(0, 100, 1 << 4, 1 << 7).floor();

	const material = new three.MeshBasicNodeMaterial({
		colorNode: posterize(
			dither.node.select(bayerDither(color, steps_remapped), color),
			steps_remapped,
		),
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
		)}
		{@render range_input(
			"steps",
			() => steps.value,
			update((value) => steps.update(value)),
		)}
		{@render checkbox_input(
			"dither",
			() => dither.value,
			update((value) => dither.update(value)),
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

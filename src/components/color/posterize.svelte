<script lang="ts">
	import * as three from "three/webgpu";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { posterize, uniform, uv } from "three/tsl";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { Context } from "@/classes/renderer_context";

	const color_a = uniform(new three.Color("#d8a521"));
	const color_b = uniform(new three.Color("#125a8d"));
	const use_posterize = uniform(true);
	const t = uniform(50);
	const steps = uniform(50);

	const _uv = uv();
	const color = t.remap(0, 100, 0, 1).mix(_uv.x, _uv.y).mix(color_a, color_b);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: use_posterize.select(
			posterize(color, steps.remap(0, 100, 1 << 4, 1 << 7).floor()),
			color,
		),
	});

	const quad = new three.QuadMesh(material);

	const context = new Context();
</script>

<div class="relative">
	<fieldset class="controls">
		{@render color_input(
			"color a",
			() => `#${color_a.value.getHexString()}`,
			(value) => {
				color_a.value.set(value);
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
		{@render color_input(
			"color b",
			() => `#${color_b.value.getHexString()}`,
			(value) => {
				color_b.value.set(value);
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
		{@render range_input(
			"t",
			() => t.value,
			(value) => {
				t.value = value;
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
		{@render range_input(
			"steps",
			() => steps.value,
			(value) => {
				steps.value = value;
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
		{@render checkbox_input(
			"posterize",
			() => use_posterize.value,
			(value) => {
				use_posterize.value = value;
				context.if_renderer((renderer) => quad.render(renderer));
			},
		)}
	</fieldset>

	<canvas
		class="aspect-square w-full"
		bind:contentBoxSize={
			null,
			([size]: ResizeObserverSize[]) => {
				context.if_renderer((renderer) => {
					resize_renderer(renderer, size.inlineSize, size.blockSize);
					quad.render(renderer);
				});
			}
		}
		{@attach (canvas) => {
			const init_renderer = new three.WebGPURenderer({
				canvas,
			})
				.init()
				.then((renderer) => {
					resize_renderer(
						renderer,
						renderer.domElement.clientWidth,
						renderer.domElement.clientHeight,
					);
					quad.render(renderer);

					const last = context.renderer;
					context.renderer = renderer;
					return () => {
						context.renderer = last;
						renderer.dispose();
					};
				});
			return () => {
				init_renderer.then((cleanup) => {
					cleanup();
				});
			};
		}}
	>
	</canvas>
</div>

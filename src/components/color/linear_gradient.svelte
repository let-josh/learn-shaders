<script lang="ts">
	import * as three from "three/webgpu";
	import { Context } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { rotateUV, uniform, uv } from "three/tsl";

	const color_a = uniform(new three.Color("#d8a521"));
	const color_b = uniform(new three.Color("#125a8d"));
	const degrees = uniform(45);
	const saturate = uniform(false);

	const radians = degrees.remap(0, 100, 0, 360).radians();

	const rx = rotateUV(uv(), radians).x;

	const t = saturate.select(rx.saturate(), rx);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: t.mix(color_a, color_b),
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
			() => `#${color_a.value.getHexString()}`,
			(value) => {
				update(() => {
					color_a.value.set(value);
				});
			},
		)}
		{@render color_input(
			"color b",
			() => `#${color_b.value.getHexString()}`,
			(value) => {
				update(() => {
					color_b.value.set(value);
				});
			},
		)}
		{@render range_input(
			"degrees",
			() => degrees.value,
			(value) => {
				update(() => {
					degrees.value = value;
				});
			},
		)}
		{@render checkbox_input(
			"saturate",
			() => saturate.value,
			(value) => {
				update(() => {
					saturate.value = value;
				});
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

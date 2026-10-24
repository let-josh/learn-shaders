<script lang="ts">
	import * as three from "three/webgpu";
	import { Context } from "@/classes/renderer_context";
	import { color_input, range_input } from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform } from "three/tsl";

	const color_a = uniform(new three.Color("#d8a521"));
	const color_b = uniform(new three.Color("#125a8d"));
	const t = uniform(50);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: t.remap(0, 100, 0, 1).mix(color_a, color_b),
	});

	const quad = new three.QuadMesh(material);

	const context = new Context();

	const render = (renderer: three.Renderer) => quad.render(renderer);

	const resize_and_render = (
		renderer: three.Renderer,
		width: number,
		height: number,
	) => {
		resize_renderer(renderer, width, height);
		render(renderer);
	};

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
			"t",
			() => t.value,
			(value) => {
				update(() => {
					t.value = value;
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
					resize_and_render(renderer, size.inlineSize, size.blockSize);
				});
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

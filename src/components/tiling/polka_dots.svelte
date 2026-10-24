<script lang="ts">
	import * as three from "three/webgpu";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Context } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform, uv, vec2 } from "three/tsl";

	const scale = uniform(50);
	const radius = uniform(50);
	const dot_color = uniform(new three.Color("#d8a521"));
	const background_color = uniform(new three.Color("#125a8d"));
	const offset = uniform(100);

	const transformed_uv = uv().mul(scale.remap(0, 100, 1, 50));

	const tile_index = transformed_uv.floor();

	const tile_uv = transformed_uv
		.add(vec2(offset.remap(0, 100, 0, 0.5), 0).mul(tile_index.y.mod(2)))
		.fract();

	const circle = tile_uv
		.sub(0.5)
		.lengthSq()
		.step(radius.remap(0, 100, 0, 0.5).pow2());

	const material = new three.MeshBasicNodeMaterial({
		colorNode: circle.mix(dot_color, background_color),
	});

	const context = new Context();

	const geometry = new three.TorusGeometry();
	const mesh = new three.Mesh(geometry, material);
	const quad = new three.QuadMesh(material);

	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 4);
	const orbit = new OrbitControls(camera);
	orbit.enabled = false;

	const render = (renderer: three.Renderer) => {
		if (orbit.enabled) renderer.render(mesh, camera);
		else quad.render(renderer);
	};

	const resize_and_render = (
		renderer: three.Renderer,
		width: number,
		height: number,
	) => {
		resize_renderer(renderer, width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		render(renderer);
	};

	const update = (callback: () => void) => {
		callback();
		context.if_renderer(render);
	};
</script>

<div class="relative">
	<fieldset class="controls">
		{@render range_input(
			"scale",
			() => scale.value,
			(value) => {
				update(() => {
					scale.value = value;
				});
			},
		)}
		{@render range_input(
			"radius",
			() => radius.value,
			(value) => {
				update(() => {
					radius.value = value;
				});
			},
		)}
		{@render range_input(
			"offset",
			() => offset.value,
			(value) => {
				update(() => {
					offset.value = value;
				});
			},
		)}
		{@render color_input(
			"dot color",
			() => `#${dot_color.value.getHexString()}`,
			(value) => {
				update(() => {
					dot_color.value.set(value);
				});
			},
		)}
		{@render color_input(
			"background color",
			() => `#${background_color.value.getHexString()}`,
			(value) => {
				update(() => {
					background_color.value.set(value);
				});
			},
		)}
		{@render checkbox_input(
			"render scene",
			() => orbit.enabled,
			(value) => update(() => (orbit.enabled = value)),
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
		{@attach controls(orbit)}
		{@attach create_renderer((renderer) => {
			const canvas = renderer.domElement;
			resize_and_render(renderer, canvas.clientWidth, canvas.clientHeight);
			const last = context.renderer;
			context.renderer = renderer;

			const on_change = () => {
				render(renderer);
			};

			orbit.addEventListener("change", on_change);
			return () => {
				orbit.removeEventListener("change", on_change);
				context.renderer = last;
			};
		})}
	>
	</canvas>
</div>

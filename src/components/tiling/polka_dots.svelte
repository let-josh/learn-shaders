<script lang="ts">
	import * as three from "three/webgpu";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform, uv, vec2 } from "three/tsl";
	import { update_camera_aspect } from "@/functions/update_camera_aspect";
	import { Context } from "@/classes/renderer_context";

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

	const resize = (renderer: three.Renderer, width: number, height: number) => {
		resize_renderer(renderer, width, height);
		update_camera_aspect(camera, width / height);
	};
</script>

<div class="relative">
	<fieldset class="controls">
		{@render range_input(
			"scale",
			() => scale.value,
			(value) => {
				scale.value = value;
				context.if_renderer(render);
			},
		)}
		{@render range_input(
			"radius",
			() => radius.value,
			(value) => {
				radius.value = value;
				context.if_renderer(render);
			},
		)}
		{@render range_input(
			"offset",
			() => offset.value,
			(value) => {
				offset.value = value;
				context.if_renderer(render);
			},
		)}
		{@render color_input(
			"dot color",
			() => `#${dot_color.value.getHexString()}`,
			(value) => {
				dot_color.value.set(value);
				context.if_renderer(render);
			},
		)}
		{@render color_input(
			"background color",
			() => `#${background_color.value.getHexString()}`,
			(value) => {
				background_color.value.set(value);
				context.if_renderer(render);
			},
		)}
		{@render checkbox_input(
			"render scene",
			() => orbit.enabled,
			(value) => {
				orbit.enabled = value;
				context.if_renderer(render);
			},
		)}
	</fieldset>

	<canvas
		class="aspect-square w-full"
		bind:contentBoxSize={
			null,
			([size]: ResizeObserverSize[]) => {
				context.if_renderer((renderer) => {
					resize(renderer, size.inlineSize, size.blockSize);
					render(renderer);
				});
			}
		}
		{@attach controls(orbit)}
		{@attach (canvas) => {
			const init_renderer = new three.WebGPURenderer({
				canvas,
			})
				.init()
				.then((renderer) => {
					resize(
						renderer,
						renderer.domElement.clientWidth,
						renderer.domElement.clientHeight,
					);
					render(renderer);

					const on_change = () => {
						render(renderer);
					};

					orbit.addEventListener("change", on_change);

					const last = context.renderer;
					context.renderer = renderer;
					return () => {
						orbit.removeEventListener("change", on_change);
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

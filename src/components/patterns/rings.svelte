<script lang="ts">
	import * as three from "three/webgpu";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { uniform, uv } from "three/tsl";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { controls } from "@/attachments/controls";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { update_camera_aspect } from "@/functions/update_camera_aspect";
	import { Context } from "@/classes/renderer_context";

	const transformed_uv = uv().sub(0.5);

	const frequency = uniform(50, "uint");
	const edge = uniform(50);
	const color_a = uniform(new three.Color("#d8a521"));
	const color_b = uniform(new three.Color("#125a8d"));

	const material = new three.MeshBasicNodeMaterial({
		colorNode: transformed_uv
			.length()
			.mul(frequency)
			.sin()
			.step(edge.remap(0, 100, -1, 1))
			.mix(color_a, color_b),
	});

	const geometry = new three.SphereGeometry();
	const mesh = new three.Mesh(geometry, material);
	const quad = new three.QuadMesh(material);

	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 3);
	const orbit = new OrbitControls(camera);
	orbit.enabled = false;

	const context = new Context();

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
			"frequency",
			() => frequency.value,
			(value) => {
				frequency.value = value;
				context.if_renderer(render);
			},
		)}
		{@render range_input(
			"edge",
			() => edge.value,
			(value) => {
				edge.value = value;
				context.if_renderer(render);
			},
		)}
		{@render color_input(
			"color a",
			() => `#${color_a.value.getHexString()}`,
			(value) => {
				color_a.value.set(value);
				context.if_renderer(render);
			},
		)}
		{@render color_input(
			"color b",
			() => `#${color_b.value.getHexString()}`,
			(value) => {
				color_b.value.set(value);
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

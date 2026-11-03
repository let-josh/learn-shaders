<script lang="ts">
	import * as three from "three/webgpu";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { checkbox_input, range_input } from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform, uv } from "three/tsl";
	import { update_camera_aspect } from "@/functions/update_camera_aspect";
	import { Context } from "@/classes/renderer_context";

	const scale = uniform(50);
	const mirror = uniform(true);

	const p = uv().mul(scale.remap(0, 100, 1, 10));

	const mirrored = p.mul(0.5).add(1).fract().mul(2).sub(1).abs();

	// same result as above but using cell index and cell uvs
	// const colorNode = p
	// 	.fract()
	// 	.sub(0.5)
	// 	.mul(p.floor().mod(2).remap(0, 1, -1, 1))
	// 	.add(0.5);

	const geometry = new three.TorusGeometry();
	const material = new three.MeshBasicNodeMaterial({
		colorNode: mirror.select(mirrored, p.fract()),
	});

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

	const context = new Context();

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
		{@render checkbox_input(
			"mirror",
			() => mirror.value,
			(value) => {
				mirror.value = value;
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

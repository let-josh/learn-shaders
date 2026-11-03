<script lang="ts">
	import * as three from "three/webgpu";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Context } from "@/classes/renderer_context";
	import { checkbox_input, range_input } from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform, uv, vec3 } from "three/tsl";
	import { update_camera_aspect } from "@/functions/update_camera_aspect";

	const scale = uniform(50);
	const blue = uniform(50);

	const geometry = new three.TorusGeometry();

	const scale_remapped = scale.remap(0, 100, 1, 10);
	const material = new three.MeshBasicNodeMaterial({
		colorNode: vec3(
			uv().mul(scale_remapped).floor().div(scale_remapped),
			blue.remap(0, 100, 0, 1),
		),
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
		{@render range_input(
			"blue",
			() => blue.value,
			(value) => {
				blue.value = value;
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

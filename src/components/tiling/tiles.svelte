<script lang="ts">
	import * as three from "three/webgpu";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Context } from "@/classes/renderer_context";
	import { checkbox_input, range_input } from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uniform, uv, vec3 } from "three/tsl";

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
			"blue",
			() => blue.value,
			(value) => {
				update(() => {
					blue.value = value;
				});
			},
		)}
		{@render checkbox_input(
			"render scene",
			() => orbit.enabled,
			(value) => {
				update(() => {
					orbit.enabled = value;
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

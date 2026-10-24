<script lang="ts">
	import * as three from "three/webgpu";
	import { Context } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { uniform, uv } from "three/tsl";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { controls } from "@/attachments/controls";
	import { resize_renderer } from "@/functions/resize_renderer";

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
			"frequency",
			() => frequency.value,
			(value) => {
				update(() => {
					frequency.value = value;
				});
			},
		)}
		{@render range_input(
			"edge",
			() => edge.value,
			(value) => {
				update(() => {
					edge.value = value;
				});
			},
		)}
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

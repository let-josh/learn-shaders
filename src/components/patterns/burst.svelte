<script lang="ts" module>
	const frequency_range = new Range({
		min: 1,
		max: 32,
	});

	const edge_range = new Range({
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Range } from "@/classes/range";
	import { Color, Float, Uint } from "@/classes/controls";
	import { RendererContext } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { uv } from "three/tsl";
	import { Mesh } from "@/classes/mesh";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { controls } from "@/attachments/controls";
	import { resize_renderer } from "@/functions/resize_renderer";

	const transformed_uv = uv().sub(0.5);

	const frequency = new Uint(Math.floor(frequency_range.midpoint) + 1);
	const edge = new Float(edge_range.midpoint);
	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");

	const material = new three.MeshBasicNodeMaterial({
		colorNode: transformed_uv.y
			.atan(transformed_uv.x)
			.mul(frequency.node)
			.sin()
			.step(edge.node.remap(edge_range.min, edge_range.max, -1, 1))
			.mix(color_a.node, color_b.node),
	});

	const geometry = new three.SphereGeometry();
	const mesh = new Mesh(material, geometry);

	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 4);
	const orbit = new OrbitControls(camera);
	const render = (renderer: three.Renderer) => mesh.render(renderer, camera);

	const context = new RendererContext();
	orbit.addEventListener("change", () => {
		context.if_renderer(render);
	});

	const update =
		<T,>(update: (value: T) => void) =>
		(value: T) => {
			update(value);
			context.if_renderer(render);
		};
</script>

<div class="relative">
	<fieldset class="controls">
		{@render range_input(
			"frequency",
			() => frequency.value,
			update((value) => frequency.update(value)),
			frequency_range,
		)}
		{@render range_input(
			"edge",
			() => edge.value,
			update((value) => edge.update(value)),
			edge_range,
		)}
		{@render color_input(
			"color a",
			() => color_a.value,
			update((value) => color_a.update(value)),
		)}
		{@render color_input(
			"color b",
			() => color_b.value,
			update((value) => color_b.update(value)),
		)}
		{@render checkbox_input(
			"quad",
			() => mesh.render_quad,
			update((value) => {
				mesh.render_quad = value;
				orbit.enabled = !value;
			}),
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		bind:contentBoxSize={
			null,
			([size]: ResizeObserverSize[]) => {
				context.if_renderer((renderer) => {
					resize_renderer(renderer, size.inlineSize, size.blockSize);
					render(renderer);
				});
			}
		}
		{@attach controls(orbit)}
		{@attach create_renderer((renderer) => {
			render(renderer);
			const canvas = renderer.domElement;
			resize_renderer(renderer, canvas.clientWidth, canvas.clientHeight);
			const last = context.renderer;
			context.renderer = renderer;
			return () => {
				context.renderer = last;
			};
		})}
	>
	</canvas>
</div>

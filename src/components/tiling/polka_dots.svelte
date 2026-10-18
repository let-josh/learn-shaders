<script lang="ts" module>
	const tile_count_range = new Range({
		min: 1,
		max: 20,
	});

	const radius_range = new Range({
		max: 5,
	});

	const offset_range = new Range({
		max: 5,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Color, Float, Uint } from "@/classes/controls/index";
	import { Mesh } from "@/classes/mesh";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uv, vec2 } from "three/tsl";

	const tile_count = new Uint(Math.floor(tile_count_range.midpoint));
	const radius = new Float(Math.floor(radius_range.midpoint));
	const dot_color = new Color("#d8a521");
	const background_color = new Color("#125a8d");
	const offset = new Float(offset_range.max);

	const transformed_uv = uv().mul(tile_count.node);

	const tile_index = transformed_uv.floor();

	const tile_uv = transformed_uv
		.add(
			vec2(
				offset.node.remap(radius_range.min, radius_range.max, 0, 0.5),
				0,
			).mul(tile_index.y.mod(2)),
		)
		.fract();

	const circle = tile_uv
		.sub(0.5)
		.length()
		.step(radius.node.remap(radius_range.min, radius_range.max, 0, 0.5));

	const material = new three.MeshBasicNodeMaterial({
		colorNode: circle.mix(dot_color.node, background_color.node),
	});

	const context = new RendererContext();

	const geometry = new three.TorusGeometry();
	const mesh = new Mesh(material, geometry);

	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 4);
	const orbit = new OrbitControls(camera);
	orbit.enabled = mesh.render_scene;

	const render = (renderer: three.Renderer) => mesh.render(renderer, camera);

	const resize_and_render = (
		renderer: three.Renderer,
		width: number,
		height: number,
	) => {
		resize_renderer(renderer, width, height);
		render(renderer);
	};

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
			"tile count",
			() => tile_count.value,
			update((value) => tile_count.update(value)),
			tile_count_range,
		)}
		{@render range_input(
			"radius",
			() => radius.value,
			update((value) => radius.update(value)),
			radius_range,
		)}
		{@render range_input(
			"offset",
			() => offset.value,
			update((value) => offset.update(value)),
			offset_range,
		)}
		{@render color_input(
			"dot color",
			() => dot_color.value,
			update((value) => dot_color.update(value)),
		)}
		{@render color_input(
			"background color",
			() => background_color.value,
			update((value) => background_color.update(value)),
		)}
		{@render checkbox_input(
			"render scene",
			() => mesh.render_scene,
			update((value) => {
				mesh.render_scene = value;
				orbit.enabled = value;
			}),
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

			const on_change = () => render(renderer);

			orbit.addEventListener("change", on_change);
			return () => {
				orbit.removeEventListener("change", on_change);
				context.renderer = last;
			};
		})}
	>
	</canvas>
</div>

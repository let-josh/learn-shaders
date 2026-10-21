<script lang="ts" module>
	const TILE_BORDER_SIZE_PERCENTAGE = 98 * (1 / 100);
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Bool, Color, Float } from "@/classes/controls/index";
	import { Mesh } from "@/classes/mesh";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { RendererContext } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { create_renderer } from "@/attachments/create_renderer";
	import { uv, vec2 } from "three/tsl";
	import { resize_renderer } from "@/functions/resize_renderer";

	const tile_count = new Float(50);
	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const color_tile_border = new Color("#d4212a");
	const r = new Float(50);
	const show_grid = new Bool(false);

	const t_uv = uv().mul(tile_count.node.remap(0, 100, 1, 25));

	const tile_uv = t_uv.fract().sub(0.5);
	const tile_index = t_uv.floor();

	const a = tile_uv.abs();
	const border = a.x.max(a.y).step(0.5 * TILE_BORDER_SIZE_PERCENTAGE);

	const scale_x = tile_index.rand().step(0.5).mul(2).sub(1);
	const flipped = tile_uv.mul(vec2(scale_x, 1));

	const offset = flipped.x.add(flipped.y).step(0).sub(0.5);

	const truchet = flipped
		.sub(offset)
		.length()
		.sub(0.5)
		.abs()
		.step(r.node.remap(0, 100, 0, 0.5 * (Math.SQRT2 - 1)))
		.mix(color_a.node, color_b.node);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: show_grid.node.select(
			border.mix(truchet, color_tile_border.node),
			truchet,
		),
	});
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

	const context = new RendererContext();

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
		{@render range_input(
			"radius",
			() => r.value,
			update((value) => r.update(value)),
		)}
		{@render checkbox_input(
			"show tile border",
			() => show_grid.value,
			update((value) => show_grid.update(value)),
		)}
		{@render color_input(
			"tile border color",
			() => color_tile_border.value,
			update((value) => color_tile_border.update(value)),
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
				context.if_renderer((renderer) =>
					resize_and_render(renderer, size.inlineSize, size.blockSize),
				);
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

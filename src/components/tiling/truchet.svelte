<script lang="ts" module>
	const tile_count_range = new Range({
		min: 1,
		max: 25,
	});

	const radius_range = new Range({
		min: 0,
		max: 10,
	});

	const TILE_BORDER_SIZE_PERCENTAGE = 98 * (1 / 100);
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Range } from "@/classes/range";
	import { Bool, Color, Float, Uint } from "@/classes/controls/index";
	import { RendererContext } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { create_renderer } from "@/attachments/create_renderer";
	import { create_resize_renderer } from "@/functions/create_resize_renderer";
	import { screenSize, uv, vec2 } from "three/tsl";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

	const tile_count = new Uint(Math.floor(tile_count_range.midpoint));
	const color_a = new Color("#d8a521");
	const color_b = new Color("#125a8d");
	const color_tile_border = new Color("#d4212a");
	const r = new Float(radius_range.midpoint);
	const show_grid = new Bool(false);

	const aspect = screenSize.div(screenSize.x.min(screenSize.y));

	const t_uv = uv().mul(tile_count.node).mul(aspect);

	const tile_uv = t_uv.fract().sub(0.5);
	const tile_index = t_uv.floor();

	const a = tile_uv.abs();
	const border = a.x.max(a.y).step(0.5 * TILE_BORDER_SIZE_PERCENTAGE);

	const random = (v: three.Node<"vec2">) =>
		v.dot(vec2(12.9898, 78.233)).sin().mul(43758.5453123).fract();

	const scale_x = random(tile_index).step(0.5).mul(2).sub(1);
	const flipped = tile_uv.mul(vec2(scale_x, 1));

	const offset = flipped.x.add(flipped.y).step(0).sub(0.5);

	const truchet = flipped
		.sub(offset)
		.length()
		.sub(0.5)
		.abs()
		.step(
			r.node.remap(
				radius_range.min,
				radius_range.max,
				0,
				0.5 * (Math.SQRT2 - 1),
			),
		)
		.mix(color_a.node, color_b.node);

	const colorNode = show_grid.node.select(
		border.mix(truchet, color_tile_border.node),
		truchet,
	);

	const material = new three.MeshBasicNodeMaterial({
		colorNode,
	});
	const quad = new three.QuadMesh(material);
	const mesh = new three.Mesh(new three.TorusGeometry(), material);
	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 4);
	const orbit = new OrbitControls(camera);

	orbit.addEventListener("change", () => {
		context.if_renderer(render);
	});

	let scene = true;
	const render = (renderer: three.Renderer) =>
		scene ? renderer.render(mesh, camera) : quad.render(renderer);

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
			tile_count_range,
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
			radius_range,
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
			"scene",
			() => scene,
			update((value) => {
				scene = orbit.enabled = value;
			}),
		)}
	</fieldset>

	<canvas
		class="aspect-square"
		{@attach (canvas) => {
			orbit.connect(canvas);
			return () => {
				orbit.disconnect();
			};
		}}
		bind:contentBoxSize={null, create_resize_renderer(context, render)}
		{@attach create_renderer(context, render)}
	>
	</canvas>
</div>

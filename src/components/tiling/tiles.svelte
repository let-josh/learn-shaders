<script lang="ts" module>
	const tile_count_range = new Range({
		min: 1,
		max: 10,
	});

	const blue_range = new Range({
		max: 10,
	});
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { Float, Uint } from "@/classes/controls/index";
	import { Mesh } from "@/classes/mesh";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Range } from "@/classes/range";
	import { RendererContext } from "@/classes/renderer_context";
	import { checkbox_input, range_input } from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { create_renderer } from "@/attachments/create_renderer";
	import { uv, vec3 } from "three/tsl";
	import { resize_renderer } from "@/functions/resize_renderer";

	const tile_count = new Uint(Math.floor(tile_count_range.midpoint));
	const blue = new Float(blue_range.midpoint);

	const geometry = new three.TorusGeometry();
	const material = new three.MeshBasicNodeMaterial({
		colorNode: vec3(
			uv().mul(tile_count.node).floor().div(tile_count.node),
			blue.node.remap(blue_range.min, blue_range.max, 0, 1),
		),
	});

	const mesh = new Mesh(material, geometry);

	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 4);
	const orbit = new OrbitControls(camera);
	const render = (renderer: three.Renderer) => mesh.render(renderer, camera);

	const context = new RendererContext();

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
			"blue",
			() => blue.value,
			update((value) => blue.update(value)),
			blue_range,
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

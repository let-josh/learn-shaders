<script lang="ts">
	import * as three from "three/webgpu";
	import { Float } from "@/classes/controls/index";
	import { Mesh } from "@/classes/mesh";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { RendererContext } from "@/classes/renderer_context";
	import { checkbox_input, range_input } from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { create_renderer } from "@/attachments/create_renderer";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { uv, vec3 } from "three/tsl";

	const tile_count = new Float(50);
	const blue = new Float(50);

	const tile_count_remapped = tile_count.node.remap(0, 100, 1, 10);

	const geometry = new three.TorusGeometry();
	const material = new three.MeshBasicNodeMaterial({
		colorNode: vec3(
			uv().mul(tile_count_remapped).floor().div(tile_count_remapped),
			blue.node.remap(0, 100, 0, 1),
		),
	});

	const mesh = new Mesh(material, geometry);

	const axis = new three.Vector3(1, 1, 2).normalize();
	const camera = new three.PerspectiveCamera().translateOnAxis(axis, 4);
	const orbit = new OrbitControls(camera);
	orbit.enabled = mesh.render_scene;

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
		)}
		{@render range_input(
			"blue",
			() => blue.value,
			update((value) => blue.update(value)),
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

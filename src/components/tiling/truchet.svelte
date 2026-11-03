<script lang="ts" module>
	const TILE_BORDER_SIZE_PERCENTAGE = 98 * (1 / 100);
</script>

<script lang="ts">
	import * as three from "three/webgpu";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
	import { Context } from "@/classes/renderer_context";
	import {
		checkbox_input,
		color_input,
		range_input,
	} from "@/components/controls.svelte";
	import { controls } from "@/attachments/controls";
	import { uniform, uv, vec2 } from "three/tsl";
	import { resize_renderer } from "@/functions/resize_renderer";
	import { update_camera_aspect } from "@/functions/update_camera_aspect";

	const scale = uniform(50);
	const color_a = uniform(new three.Color("#d8a521"));
	const color_b = uniform(new three.Color("#125a8d"));
	const color_tile_border = uniform(new three.Color("#d4212a"));
	const r = uniform(50);
	const show_grid = uniform(false);

	const t_uv = uv().mul(scale.remap(0, 100, 1, 25));

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
		.step(r.remap(0, 100, 0, 0.5 * (Math.SQRT2 - 1)))
		.mix(color_a, color_b);

	const material = new three.MeshBasicNodeMaterial({
		colorNode: show_grid.select(
			border.mix(truchet, color_tile_border),
			truchet,
		),
	});
	const geometry = new three.TorusGeometry();
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

	const resize = (renderer: three.Renderer, width: number, height: number) => {
		resize_renderer(renderer, width, height);
		update_camera_aspect(camera, width / height);
	};

	const context = new Context();
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
		{@render color_input(
			"color a",
			() => `#${color_a.value.getHexString()}`,
			(value) => {
				color_a.value.set(value);
				context.if_renderer(render);
			},
		)}
		{@render color_input(
			"color b",
			() => `#${color_b.value.getHexString()}`,
			(value) => {
				color_b.value.set(value);
				context.if_renderer(render);
			},
		)}
		{@render range_input(
			"radius",
			() => r.value,
			(value) => {
				r.value = value;
				context.if_renderer(render);
			},
		)}
		{@render checkbox_input(
			"show tile border",
			() => show_grid.value,
			(value) => {
				show_grid.value = value;
				context.if_renderer(render);
			},
		)}
		{@render color_input(
			"tile border color",
			() => `#${color_tile_border.value.getHexString()}`,
			(value) => {
				color_tile_border.value.set(value);
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

// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Docs with Tailwind",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/withastro/starlight",
				},
			],
			sidebar: [
				{
					label: "Color",
					items: [
						{
							autogenerate: {
								directory: "color",
							},
						},
					],
				},
				{
					label: "Tiling",
					items: [
						{
							autogenerate: {
								directory: "tiling",
							},
						},
					],
				},
				{
					label: "Patterns",
					items: [
						{
							autogenerate: {
								directory: "patterns",
							},
						},
					],
				},
			],
			customCss: ["./src/styles/global.css"],
		}),
		svelte(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});

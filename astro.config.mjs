// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

const site = "https://let-josh.github.io";

const base = "/learn-shaders";

const repo_url = "https://github.com/let-josh" + base;

// https://astro.build/config
export default defineConfig({
	base,
	integrations: [
		starlight({
			title: "Learn Shaders",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: repo_url,
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
	site,
	vite: {
		plugins: [tailwindcss()],
	},
});

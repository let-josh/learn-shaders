import type { HTMLInputAttributes } from "svelte/elements";

type Range = {
	[X in keyof Pick<HTMLInputAttributes, "min" | "max" | "step">]-?: number;
};

export type { Range };

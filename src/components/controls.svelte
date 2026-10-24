<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";

	type Attributes = Omit<HTMLInputAttributes, "type" | `bind:${string}`>;

	export { checkbox_input, color_input, range_input };

	const label_class = "flex justify-between gap-2";
</script>

{#snippet checkbox_input(
	label: string,
	get_value: () => boolean,
	set_value: (value: boolean) => void,
	attributes?: Attributes,
)}
	<label class={label_class}>
		{label}
		<input
			type="checkbox"
			bind:checked={get_value, set_value}
			{...attributes}
		/>
	</label>
{/snippet}

{#snippet color_input(
	label: string,
	get_value: () => string,
	set_value: (value: string) => void,
	attributes?: Attributes,
)}
	<label class={label_class}>
		{label}
		<input type="color" bind:value={get_value, set_value} {...attributes} />
	</label>
{/snippet}

{#snippet range_input(
	label: string,
	get_value: () => number,
	set_value: (value: number) => void,
	attributes?: Attributes,
)}
	<label class={label_class}>
		{label}
		<input type="range" bind:value={get_value, set_value} {...attributes} />
	</label>
{/snippet}

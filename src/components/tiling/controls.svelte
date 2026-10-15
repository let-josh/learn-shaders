<script lang="ts" module>
	export { checkbox_input, color_input, range_input };
	import { Range } from "@/classes/range";
</script>

{#snippet checkbox_input(
	label: string,
	get_value: () => boolean,
	set_value: (value: boolean) => void,
)}
	<label class="label">
		{label}
		<input type="checkbox" bind:checked={get_value, set_value} />
	</label>
{/snippet}

{#snippet color_input(
	label: string,
	get_value: () => string,
	set_value: (value: string) => void,
)}
	<label class="label">
		{label}
		<input type="color" bind:value={get_value, set_value} />
	</label>
{/snippet}

{#snippet range_input(
	label: string,
	get_value: () => number,
	set_value: (value: number) => void,
	range = new Range(),
)}
	<label class="label">
		{label}
		<input type="range" {...range} bind:value={get_value, set_value} />
	</label>
{/snippet}

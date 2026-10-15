class Range {
	min;
	max;
	step;
	constructor({
		min = 0,
		max = 100,
		step = 1,
	}: Partial<{
		min: number;
		max: number;
		step: number;
	}> = {}) {
		this.min = min;
		this.max = max;
		this.step = step;
	}
	get midpoint() {
		return 0.5 * (this.max + this.min);
	}
}

export { Range };

import { uniform } from "three/tsl";

class Float {
	#value;
	node;
	constructor(value = 0) {
		this.#value = $state(value);
		this.node = uniform(value);
	}
	get value() {
		return this.#value;
	}
	update(value: Float["value"]) {
		this.#value = value;
		this.node.value = value;
	}
}

export { Float };

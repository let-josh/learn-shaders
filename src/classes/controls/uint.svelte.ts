import { uniform } from "three/tsl";

class Uint {
	#value;
	node;
	constructor(value = 0) {
		this.#value = $state(value);
		this.node = uniform(value, "uint");
	}
	get value() {
		return this.#value;
	}
	update(value: Uint["value"]) {
		this.#value = value;
		this.node.value = value;
	}
}

export { Uint };

import { uniform } from "three/tsl";

class Bool {
	#value;
	node;
	constructor(value = false) {
		this.#value = $state(value);
		this.node = uniform(value);
	}
	get value() {
		return this.#value;
	}
	update(value: Bool["value"]) {
		this.#value = value;
		this.node.value = value;
	}
}

export { Bool };

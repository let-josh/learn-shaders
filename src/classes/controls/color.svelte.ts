import { Color as ThreeColor } from "three/webgpu";
import { uniform } from "three/tsl";

class Color {
	value;
	node;
	constructor(value = "#000000") {
		this.value = $state(value);
		this.node = uniform(new ThreeColor(value));
	}
	update(value: Color["value"]) {
		this.value = value;
		this.node.value.set(value);
	}
}

const update = (color: Color, value: Color["value"]) => {
	color.value = value;
	color.node.value.set(value);
};

export { Color };

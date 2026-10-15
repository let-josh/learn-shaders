import type * as three from "three/webgpu";
import type { Attachment } from "svelte/attachments";

const controls = (controls: three.Controls): Attachment<HTMLElement> => {
	return (element) => {
		controls.connect(element);
		return () => {
			controls.disconnect();
		};
	};
};

export { controls };

import type * as three from "three/webgpu";

const update_camera_aspect = (camera: three.PerspectiveCamera, aspect = 1) => {
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
};

export { update_camera_aspect };

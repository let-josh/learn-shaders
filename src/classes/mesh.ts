import * as three from "three/webgpu";

class Mesh {
	quad;
	mesh;
	render_scene = false;
	constructor(material: three.NodeMaterial, geometry: three.BufferGeometry) {
		this.quad = new three.QuadMesh(material);
		this.mesh = new three.Mesh(geometry, material);
	}
	render(renderer: three.Renderer, camera: three.Camera) {
		this.render_scene
			? renderer.render(this.mesh, camera)
			: this.quad.render(renderer);
	}
}

export { Mesh };

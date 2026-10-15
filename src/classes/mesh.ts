import * as three from "three/webgpu";

class Mesh {
	quad;
	mesh;
	render_quad = false;
	constructor(material: three.NodeMaterial, geometry: three.BufferGeometry) {
		this.quad = new three.QuadMesh(material);
		this.mesh = new three.Mesh(geometry, material);
	}
	render(renderer: three.Renderer, camera: three.Camera) {
		this.render_quad
			? this.quad.render(renderer)
			: renderer.render(this.mesh, camera);
	}
}

export { Mesh };

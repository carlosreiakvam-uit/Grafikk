'use strict';

/**
 * Basis for alle shape-klassene.
 */
export class BaseShape {

    constructor(app) {
        this.app = app;
        this.gl = app.gl;
        this.camera = app.camera;

        this.vertexCount = 0;

		// Vertex info arrays:
		this.positions = [];
		this.colors = [];

		// Referanser til alle buffer:
		this.buffers = {
			position: undefined,
			color: undefined
		};

		// Brukes i connectPositionAttribute() m.fl.:
		this.numComponents = -1;
		this.type = this.gl.FLOAT;
		this.normalize = false;
		this.stride = 0;
		this.offset = 0;
    }

	/**
	 * Oppretter posisjon-, fargebuffer m.m.
	 */
    initBuffers() {
		// Kaller på ev. overstyrt funksjon i subklasser:
		this.createVertices();

		// Posisjon:
		if (this.positions.length > 0) {
			this.buffers.position = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
		}

		// Farge:
		if (this.colors.length > 0) {
			this.buffers.color = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		}

		this.vertexCount = this.positions.length/3;
    }

	/**
	 * Kan overstyres av subklasser.
	 */
	createVertices() {
		this.setPositions();
		this.setColors();
	}

	/**
	 * Kan overstyres av subklasser.
	 */
	setPositions() {
		this.positions = [];
	}

	/**
	 * Kan overstyres av subklasser.
	 */
	setColors() {
		this.colors = [];
	}

    /**
     * Kopler til og aktiverer position-bufferet.
     */
	connectPositionAttribute(shaderInfo) {
		if (!this.buffers.position)
			return;

		this.numComponents = 3;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(
			shaderInfo.attribLocations.vertexPosition,
			this.numComponents,
			this.type,
			this.normalize,
			this.stride,
			this.offset);
		this.gl.enableVertexAttribArray(shaderInfo.attribLocations.vertexPosition);
	}

    /**
     * Kopler til og aktiverer color-bufferet.
     */
	connectColorAttribute(shaderInfo) {
		if (!this.buffers.color || !shaderInfo.attribLocations.vertexColor)
			return;

		this.numComponents = 4;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(
			shaderInfo.attribLocations.vertexColor,
			this.numComponents,
			this.type,
			this.normalize,
			this.stride,
			this.offset);
		this.gl.enableVertexAttribArray(shaderInfo.attribLocations.vertexColor);
	}

	setCameraMatrices(shaderInfo, modelMatrix) {
		this.camera.set();  //NB!
		let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);
		if (shaderInfo.uniformLocations.modelViewMatrix)
			this.gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
		if (shaderInfo.uniformLocations.projectionMatrix)
			this.gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, this.camera.projectionMatrix.elements);
	}

	draw(shaderInfo, elapsed, modelMatrix) {
		if  (!shaderInfo)
			return;
		// Anngi shaderprogram som skal brukes:
		this.gl.useProgram(shaderInfo.program);

		// Kople til buffer og send verdier til shaderne:
		this.connectPositionAttribute(shaderInfo);
		this.connectColorAttribute(shaderInfo);

		// Send matriser til shaderen:
		this.setCameraMatrices(shaderInfo, modelMatrix);
	}
}

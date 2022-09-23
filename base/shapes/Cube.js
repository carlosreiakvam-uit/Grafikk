'use strict';

export class Cube {

    constructor() {
        this.positionsBuffer = this.initPositionBuffers()
        this.initColorBuffers = this.initColorBuffers()
    }

    initPositionBuffers() {
        return [
            0, 0, 0,
            0.5, 1, 0,
            1, 0, 0
        ]
    }

    initColorBuffers() {
        return [
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,
        ]
    }

    bindBuffers(gl) {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    // draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
    //     super.draw(shaderInfo, elapsed, modelMatrix);
    //     this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    // }
}
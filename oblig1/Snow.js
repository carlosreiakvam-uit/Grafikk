import {connectColorAttribute, connectPositionAttribute} from "./Common.js";
import {cubeSideLength} from "./Constants.js";
import {UpdateModeViewAndProjectionMatrix} from "./Utils.js";

export function drawSnow(renderInfo, camera) {
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.snowBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.snowBuffer.color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();

    modelMatrix.translate(renderInfo.snowAnimation.xPosition, renderInfo.snowAnimation.yPosition, 0);
    camera.set();
    UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "POINTS", "snowBuffer")
}

export function snowBuffer(gl) {
    let positions = [];
    let colors = [];
    for (let i = 0; i <= 1000; i += 1) {
        const x = (Math.random() * 10) - (Math.random() * 10);
        const y = -(Math.random() * cubeSideLength/4);
        const z = (Math.random() * 10) - (Math.random() * 10);

        let vert1 = [x, y, z];
        let color1 = [0,0,1]
        positions = positions.concat(vert1);
        colors.concat(color1);

    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer, color: colorBuffer, vertexCount: positions.length / 3
    };
}
import {connectColorAttribute, connectPositionAttribute} from "./Common.js";
import {cubeSideLength} from "./Constants.js";
import {bindBuffer, UpdateModeViewAndProjectionMatrix} from "./Utils.js";

export function drawCoord(renderInfo, camera) {
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.coordsBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.coordsBuffer.color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();

    camera.set();
    UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "LINES", "coordsBuffer")
}

export function coordinateSystemBuffer(gl) {
    const h = cubeSideLength;

    const positionVertices = new Float32Array([
        //X
        h, 0, 0, -h, 0, 0,

        //Y
        0, -h, 0, 0, h, 0,

        //Z
        0, 0, -h, 0, 0, h,]);

    const colorVertices = new Float32Array([
        1, 0, 0, 1,
        1, 0, 0, 1,

        0, 1, 0, 1,
        0, 1, 0, 1,

        0, 0, 1, 1,
        0, 0, 1, 1,
    ]);

    const positionBuffer = bindBuffer(gl, positionVertices);
    const colorBuffer = bindBuffer(gl, colorVertices);

    return {
        position: positionBuffer, color: colorBuffer, vertexCount: positionVertices.length / 3
    };
}
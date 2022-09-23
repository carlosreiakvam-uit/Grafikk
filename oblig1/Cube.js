import {connectColorAttribute, connectPositionAttribute} from "./Common.js";
import {cubeSideLength} from "./Constants.js";
import {bindBuffer, UpdateModeViewAndProjectionMatrix} from "./Utils.js";

export function drawCube(renderInfo, camera) {
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.cubesBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.cubesBuffer.color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    camera.set();

    UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "TRIANGLES", "cubesBuffer");
}

export function cubeBuffer(gl) {
    const h = cubeSideLength;

    const positionVertices = [
        //Front
        h, h, h,
        -h, h, h,
        -h, -h, h,
        h, h, h,
        -h, -h, h,
        h, -h, h,

        //Back
        h, h, -h,
        -h, h, -h,
        -h, -h, -h,
        h, h, -h,
        -h, -h, -h,
        h, -h, -h,

        //Left
        -h, h, h,
        -h, h, -h,
        -h, -h, -h,
        -h, h, h,
        -h, -h, -h,
        -h, -h, h,

        //Right
        h, h, h,
        h, h, -h,
        h, -h, -h,
        h, h, h,
        h, -h, -h,
        h, -h, h,

        //Bottom
        h, -h, h,
        -h, -h, h,
        -h, -h, -h,
        h, -h, h,
        -h, -h, -h,
        h, -h, -h,

        //Top
        h, h, h,
        -h, h, h,
        -h, h, -h,
        h, h, h,
        -h, h, -h,
        h, h, -h,

    ];

    const colorVertices = [
        //Front
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A

        //Back
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A

        //Left
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A

        //Right
        1, 1, 0, 1,   //R G B A
        1, 1, 0, 1,   //R G B A
        1, 1, 0, 1,   //R G B A
        1, 1, 0, 1,   //R G B A
        1, 1, 0, 1,   //R G B A
        1, 1, 0, 1,   //R G B A

        //Bottom
        1, 0, 1, 1,   //R G B A
        1, 0, 1, 1,   //R G B A
        1, 0, 1, 1,   //R G B A
        1, 0, 1, 1,   //R G B A
        1, 0, 1, 1,   //R G B A
        1, 0, 1, 1,   //R G B A

        //Top
        0, 0, 0, 0,  //R G B A
        0, 0, 0, 0,  //R G B A
        0, 0, 0, 0,  //R G B A
        0, 0, 0, 0,  //R G B A
        0, 0, 0, 0,  //R G B A
        0, 0, 0, 0,  //R G B A
    ];

    const positionBuffer = bindBuffer(gl, positionVertices);
    const colorBuffer = bindBuffer(gl, colorVertices);

    return {
        position: positionBuffer, color: colorBuffer, vertexCount: positionVertices.length / 3
    };
}
import {connectColorAttribute, connectPositionAttribute} from "./Common.js";
import {bindBuffer, UpdateModeViewAndProjectionMatrix} from "./Utils.js";

export function draw2DCircleWireFrameColor(renderInfo, camera) {
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.wireFrameTwoDCircleBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.wireFrameTwoDCircleBuffer.color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    modelMatrix.translate(renderInfo.solidCirclePos.x, renderInfo.solidCirclePos.y, renderInfo.solidCirclePos.z);
    camera.set();

    UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "LINE_STRIP", "wireFrameTwoDCircleBuffer");
}

export function draw2DCircleSolidColor(renderInfo, camera) {

    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.solidTwoDCircleBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.solidTwoDCircleBuffer.color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    modelMatrix.translate(renderInfo.wireFrameCirclePos.x, renderInfo.wireFrameCirclePos.y, renderInfo.wireFrameCirclePos.z);
    modelMatrix.scale(2.5, 2.5, 2.5);
    camera.set();

    UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "TRIANGLE_STRIP", "solidTwoDCircleBuffer");
}

function generateCircleVertices(vertices = []) {
    let positionVertices = []
    for (let i = 0.0; i <= 360; i += 1) {
        let j = i * Math.PI / 180;
        let vert1 = [Math.sin(j), 0, Math.cos(j)];
        positionVertices = positionVertices.concat(vert1);
        positionVertices = positionVertices.concat(vertices);
    }
    return positionVertices;
}


export function solidTwoDCircleBuffer(gl) {
    let positionVertices = generateCircleVertices([0,0,0]);

    let colorVertices = []
    let r = Math.random()
    let g = Math.random()
    let b = Math.random()
    let a = 1
    for (let i = 0; i < positionVertices.length; i++) {
        if (i % Math.round(positionVertices.length / 9) === 0) {
            r = Math.random()
            g = Math.random()
            b = Math.random()
            a = 1
        }
        colorVertices = colorVertices.concat(r)
        colorVertices = colorVertices.concat(g)
        colorVertices = colorVertices.concat(b)
        colorVertices = colorVertices.concat(a)
    }

    const positionBuffer = bindBuffer(gl, positionVertices);
    const colorBuffer = bindBuffer(gl, colorVertices);

    return {
        position: positionBuffer, color: colorBuffer, vertexCount: positionVertices.length/3
    };
}

export function wireFrameTwoDCircleBuffer(gl) {
    let positionVertices = generateCircleVertices();

    const colors = [];

    const positionBuffer = bindBuffer(gl, positionVertices);
    const colorBuffer = bindBuffer(gl, colors);

    return {
        position: positionBuffer, color: colorBuffer, vertexCount: positionVertices.length/3
    };
}


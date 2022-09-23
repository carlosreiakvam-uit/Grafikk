import {connectColorAttribute, connectPositionAttribute} from "./Common.js";
import {bindBuffer, UpdateModeViewAndProjectionMatrix} from "./Utils.js";
import {Colors, Cylinders} from "./Constants.js";

function buildUnitCircleVertices(sectorCount) {
    let sectorStep = 2 * Math.PI / sectorCount;
    let sectorAngle = 0;
    let vertices = new Float32Array((sectorCount + 1) * 2);

    for (let i = 0, j = 0; i <= sectorCount; ++i, j += 2) {
        sectorAngle = i * sectorStep;
        vertices[j] = Math.cos(sectorAngle);
        vertices[j + 1] = Math.sin(sectorAngle);
    }
    return vertices;
}

function cylinders(sectorCount, radius, height) {
    let unitCircleVertices = buildUnitCircleVertices(sectorCount);
    let vertices = new Float32Array(unitCircleVertices.length * 18);
    let halfHeight = height / 2;
    let cos, sin, nextSin, nextCos;
    for (let i = 0; i < unitCircleVertices.length; i += 2) {
        cos = unitCircleVertices[i];
        sin = unitCircleVertices[i + 1];
        if (i + 1 < unitCircleVertices.length) {
            nextCos = unitCircleVertices[i + 2];
            nextSin = unitCircleVertices[i + 3];
        } else {
            // Last sector
            nextCos = unitCircleVertices[0];
            nextSin = unitCircleVertices[1];
        }

        let j = i * 18

        // Top triangle
        addVertex(vertices, j, 0, halfHeight, 0) // Center of the circle
        addVertex(vertices, j + 3, radius * sin, halfHeight, radius * cos);
        addVertex(vertices, j + 6, radius * nextSin, halfHeight, radius * nextCos);
        // First half of the wall
        addVertex(vertices, j + 9, radius * sin, halfHeight, radius * cos);
        addVertex(vertices, j + 12, radius * sin, -halfHeight, radius * cos);
        addVertex(vertices, j + 15, radius * nextSin, halfHeight, radius * nextCos);
        // second half of the wall
        addVertex(vertices, j + 18, radius * nextSin, halfHeight, radius * nextCos);
        addVertex(vertices, j + 21, radius * sin, -halfHeight, radius * cos);
        addVertex(vertices, j + 24, radius * nextSin, -halfHeight, radius * nextCos)
        // Bottom triangle
        addVertex(vertices, j + 27, 0, -halfHeight, 0) // Center of the circle
        addVertex(vertices, j + 30, radius * sin, -halfHeight, radius * cos);
        addVertex(vertices, j + 33, radius * nextSin, -halfHeight, radius * nextCos);
    }

    return vertices;
}

export function cylinderBuffer(gl, sectorCount, radius, height, color) {

    const positionVertices = cylinders(sectorCount, radius, height);
    let colorVertices = [];

    if (color === Colors.Circus) {
        for (let i = 0; i < positionVertices.length / 9; i++) {
            let fillColor = [Math.random(), Math.random(), Math.random(), 1];
            colorVertices.push(...fillColor);
            colorVertices.push(...fillColor);
            colorVertices.push(...fillColor);
        }
    } else {
        let fillColor = [Math.random(), Math.random(), Math.random(), 1];
        for (let i = 0; i < positionVertices.length / 3; i++) {
            colorVertices.push(...fillColor);
        }
    }

    const positionBuffer = bindBuffer(gl, positionVertices);
    const colorBuffer = bindBuffer(gl, colorVertices);

    return {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: positionVertices.length / 3
    };
}

function addVertex(vertices, index, x, y, z) {
    vertices[index] = x;
    vertices[index + 1] = y;
    vertices[index + 2] = z;
}

export function drawCylinder(renderInfo, camera, cylinderType) {
    let bufferName, posName
    if (cylinderType === Cylinders.Circus) {
        bufferName = "cylinderBuffer";
        posName = "cylinderPos";
    } else {
        bufferName = "cylinder" + cylinderType + "Buffer";
        posName = "cylinder" + cylinderType + "Pos";
    }

    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo[bufferName].position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo[bufferName].color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    modelMatrix.translate(renderInfo[posName].x, renderInfo[posName].y, renderInfo[posName].z);

    modelMatrix.rotate(renderInfo.cylinderAnimation.angle * renderInfo[posName].direction, 1, 0, 0)
    camera.set();

    if (cylinderType === Cylinders.WireFrame) {
        UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "LINE_STRIP", bufferName)
    } else if ((cylinderType === Cylinders.Solid) || cylinderType === Cylinders.Circus){
        UpdateModeViewAndProjectionMatrix(camera, modelMatrix, renderInfo, "TRIANGLES", bufferName)
    } else {
        throw Error("Invalid cylindertype")
    }

}
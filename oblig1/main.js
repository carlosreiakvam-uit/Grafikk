import {WebGLCanvas} from '../base/helpers/WebGLCanvas.js';
import {Camera} from "../base/helpers/Camera.js";
import {cylinderBuffer, drawCylinder} from "./Cylinders.js";
import {initBaseShaders} from "./Common.js";
import {
    draw2DCircleSolidColor,
    draw2DCircleWireFrameColor,
    solidTwoDCircleBuffer,
    wireFrameTwoDCircleBuffer
} from "./Circles.js";
import {cubeBuffer, drawCube} from "./Cube.js";
import {coordinateSystemBuffer, drawCoord} from "./CoordinateSystem.js";
import {clearCanvas, getElapsed, initKeyPress, plusOrMinus, randomPos} from "./Utils.js";
import {drawSnow, snowBuffer} from "./Snow.js";
import {Colors, cubeSideLength, Cylinders} from "./Constants.js";


export function main() {

    const webGLCanvas = new WebGLCanvas('myCanvas', document.body, window.innerWidth, window.innerHeight);
    const renderInfo = {
        gl: webGLCanvas.gl,
        currentlyPressedKeys: [],
        baseShaderInfo: initBaseShaders(webGLCanvas.gl),
        coordsBuffer: coordinateSystemBuffer(webGLCanvas.gl),
        cameraControl: {camera: 1},
        cubesBuffer: cubeBuffer(webGLCanvas.gl),
        wireFrameTwoDCircleBuffer: wireFrameTwoDCircleBuffer(webGLCanvas.gl),
        solidTwoDCircleBuffer: solidTwoDCircleBuffer(webGLCanvas.gl),
        snowBuffer: snowBuffer(webGLCanvas.gl),
        cylinderBuffer: cylinderBuffer(webGLCanvas.gl, 25, 1, 2,),
        cylinder2Buffer: cylinderBuffer(webGLCanvas.gl, 25, 0.7, 2.5, Colors.Circus),
        cylinder3Buffer: cylinderBuffer(webGLCanvas.gl, 25, 2, 2),
        cylinderPos: {
            x: randomPos(), y: randomPos(), z: randomPos(), direction: plusOrMinus()
        },
        cylinder2Pos: {
            x: randomPos(), y: randomPos(), z: randomPos(), direction: plusOrMinus()
        },
        cylinder3Pos: {
            x: randomPos(), y: randomPos(), z: randomPos(), direction: plusOrMinus()
        },
        solidCirclePos: {
            x: randomPos(), y: 0, z: randomPos(), direction: plusOrMinus()
        },
        wireFrameCirclePos: {
            x: randomPos(), y: 0, z: randomPos(), direction: plusOrMinus()
        },
        lastTime: 0,
        snowAnimation: {
            xPosition: 0, yPosition: 20, fallingSpeed: 2
        },
        cylinderAnimation: {
            angle: 0, rotationSpeed: 60
        }
    }

    initKeyPress(renderInfo);
    if (renderInfo.currentlyPressedKeys) {
        console.log(renderInfo.currentlyPressedKeys.values())
    }
    const camera1 = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys, 75,75,100);
    const camera2 = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys, -3, 10, 4, 1, 1, 0);
    animate(0, renderInfo, camera1, camera2);
}

function animate(currentTime, renderInfo, camera1, camera2) {

    if (currentTime === undefined) currentTime = 0; //Udefinert første gang.
    let elapsed = getElapsed(currentTime, renderInfo);

    UpdateCameraControl(renderInfo, camera1, camera2, elapsed)
    UpdateSnowAnimation(renderInfo, elapsed, currentTime);
    UpdateCylinderAnimation(renderInfo, elapsed, currentTime)

    draw(currentTime, renderInfo, camera1, camera2);

    window.requestAnimationFrame((currentTime) => {
        animate(currentTime, renderInfo, camera1, camera2);
    });
}

function draw(currentTime, renderInfo, camera1, camera2) {
    clearCanvas(renderInfo.gl);

    // Camera 1
    renderInfo.gl.viewport(0, window.innerHeight/4, window.innerWidth/2, window.innerHeight/2)
    drawSnow(renderInfo, camera1);
    draw2DCircleSolidColor(renderInfo, camera1);
    draw2DCircleWireFrameColor(renderInfo, camera1);
    drawCoord(renderInfo, camera1);
    drawCube(renderInfo, camera1);
    drawCylinder(renderInfo, camera1, Cylinders.Circus);
    drawCylinder(renderInfo, camera1, Cylinders.Solid);
    drawCylinder(renderInfo, camera1, Cylinders.WireFrame);

    // Camera 2
    renderInfo.gl.viewport(window.innerWidth/2, window.innerHeight/4, window.innerWidth/2-2, window.innerHeight/2)
    drawSnow(renderInfo, camera2);
    draw2DCircleSolidColor(renderInfo, camera2);
    draw2DCircleWireFrameColor(renderInfo, camera2);
    drawCoord(renderInfo, camera2);
    drawCube(renderInfo, camera2);
    drawCylinder(renderInfo, camera2, Cylinders.Circus);
    drawCylinder(renderInfo, camera2, Cylinders.Solid);
    drawCylinder(renderInfo, camera2, Cylinders.WireFrame);
}

function UpdateCylinderAnimation(renderInfo, elapsed, currentTime) {
    renderInfo.cylinderAnimation.angle = renderInfo.cylinderAnimation.angle + (renderInfo.cylinderAnimation.rotationSpeed * elapsed);
    renderInfo.cylinderAnimation.angle %= 360; // "Rull rundt" dersom angle >= 360 grader.
    renderInfo.lastTime = currentTime;
}

function UpdateSnowAnimation(renderInfo, elapsed, currentTime) {
    renderInfo.snowAnimation.yPosition = renderInfo.snowAnimation.yPosition - (renderInfo.snowAnimation.fallingSpeed * elapsed)
    if (renderInfo.snowAnimation.yPosition <= -cubeSideLength * 3/4) {
        renderInfo.snowBuffer = snowBuffer(renderInfo.gl);
        renderInfo.snowAnimation.yPosition = cubeSideLength;
        renderInfo.snowAnimation.xPosition = 0;
    }

    let randomXDirection = Math.floor(Math.random() * 3);

    if (randomXDirection === 1) {
        renderInfo.snowAnimation.xPosition = renderInfo.snowAnimation.xPosition + 0.01;
    } else if (randomXDirection === 2) {
        renderInfo.snowAnimation.xPosition = renderInfo.snowAnimation.xPosition - 0.01;
    }
    renderInfo.snowAnimation.counter += 1;
    renderInfo.snowAnimation.lastTime = currentTime; // Setter lastTime til currentTime.
}

function UpdateCameraControl(renderInfo, camera1, camera2, elapsed) {
    if (renderInfo.cameraControl.camera === 1) {
        camera1.handleKeys(elapsed);
    } else {
        camera2.handleKeys(elapsed);
    }
}




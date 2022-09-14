import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';
import {Camera} from "../../../base/helpers/Camera.js";

/**
 * Et WebGL-program som tegner en enkel trekant.
 * Bruker en egen Camera-klasse som håndterer view, viewmodel og
 * projection-matrisene.
 */

export function main() {
    // Oppretter et webGLCanvas for WebGL-tegning:
    const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
    // Hjelpeobjekt som holder på objekter som trengs for rendring:
    const renderInfo = {
        gl: webGLCanvas.gl,
        baseShaderInfo: initBaseShaders(webGLCanvas.gl),
        spheres: [],
        SPHERE_COUNT: 100,
        coordBuffers: initCoordBuffers(webGLCanvas.gl),
        earthBuffer: initSphereBuffers(webGLCanvas.gl, [1, 0, 0.5, 1]),
        moonBuffer: initSphereBuffers(webGLCanvas.gl, [0, 0.8, 0.9, 1]),
        currentlyPressedKeys: [],
        lastTime: 0,
        planetsAnimation: {     //Hjelpeobjekt som holder på animasjonsinfo:
            earthRotationAngle: 0,
            earthRotationsSpeed: 5,
            moonRotationAngle: 0,
            moonOrbitAngle: 1,
            moonTranslation: 10,
            moonRotationsSpeed: 8.8,
            moonOrbitSpeed: 8.1,
            lastTime: 0
        },
        fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,
            lastTimeStamp: 0
        }
    };

    initKeyPress(renderInfo.currentlyPressedKeys);
    const camera = new Camera(renderInfo.gl, renderInfo.currentlyPressedKeys);
    animate(0, renderInfo, camera);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(currentlyPressedKeys) {
    document.addEventListener('keyup', (event) => {
        currentlyPressedKeys[event.which] = false;
    }, false);
    document.addEventListener('keydown', (event) => {
        currentlyPressedKeys[event.which] = true;
        console.log(event)
    }, false);
}

function initBaseShaders(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return {
        program: glslShader.shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
        },
    };
}

/**
 * Oppretter verteksbuffer for koordinatsystemet.
 * 6 vertekser, 2 for hver akse.
 * Tegnes vha. gl.LINES
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initCoordBuffers(gl) {
    const extent = 100;

    const positions = new Float32Array([
        -extent, 0, 0,
        extent, 0, 0,
        0, -extent, 0,
        0, extent, 0,
        0, 0, -extent,
        0, 0, extent
    ]);

    const colors = new Float32Array([
        1, 0, 0, 1,   //R G B A
        1, 0, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 1, 0, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
        0, 0, 1, 1,   //R G B A
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
        color: colorBuffer,
        vertexCount: positions.length / 3
    };
}

/**
 * Aktiverer position-bufferet.
 * Kalles fra draw()
 */
function connectPositionAttribute(gl, baseShaderInfo, positionBuffer) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexPosition);
}

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
function connectColorAttribute(gl, baseShaderInfo, colorBuffer) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexColor);
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
    gl.clearColor(0.1, 0.1, 0.1, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function animate(currentTime, renderInfo, camera) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime, renderInfo, camera);
    });

    // Finner tid siden siste kall på draw().
    let elapsed = getElapsed(currentTime, renderInfo);
    calculateFps(currentTime, renderInfo.fpsInfo);

    renderInfo.planetsAnimation.earthRotationAngle += (renderInfo.planetsAnimation.earthRotationsSpeed * elapsed);
    renderInfo.planetsAnimation.earthRotationAngle %= 360;

    renderInfo.planetsAnimation.moonRotationAngle += (renderInfo.planetsAnimation.moonRotationsSpeed * elapsed);
    renderInfo.planetsAnimation.moonRotationAngle %= 360;

    // renderInfo.planetsAnimation.moonTranslation += (renderInfo.planetsAnimation.moonTranslation * elapsed)
    // renderInfo.planetsAnimation.moonTranslation %= 180

    renderInfo.planetsAnimation.moonOrbitAngle += (renderInfo.planetsAnimation.moonOrbitSpeed * elapsed);
    renderInfo.planetsAnimation.moonOrbitAngle %= 360;

    camera.handleKeys(elapsed);
    draw(renderInfo, camera);
}

/**
 * Beregner forløpt tid siden siste kall.
 * @param currentTime
 * @param renderInfo
 */
function getElapsed(currentTime, renderInfo) {
    let elapsed = 0.0;
    if (renderInfo.lastTime !== 0.0)	// Først gang er lastTime = 0.0.
        elapsed = (currentTime - renderInfo.lastTime) / 1000; // Deler på 1000 for å operere med sekunder.
    renderInfo.lastTime = currentTime;						// Setter lastTime til currentTime.
    return elapsed;
}

/**
 * Beregner og viser FPS.
 * @param currentTime
 * @param  fpsInfo
 */
function calculateFps(currentTime, fpsInfo) {
    if (!currentTime) currentTime = 0;
    // Sjekker om  ET sekund har forløpt...
    if (currentTime - fpsInfo.lastTimeStamp >= 1000) {
        // Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById('fps').innerHTML = fpsInfo.frameCount;
        // Nullstiller fps-teller:
        fpsInfo.frameCount = 0;
        //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
        fpsInfo.lastTimeStamp = currentTime;
    }
    // Øker antall frames per sekund:
    fpsInfo.frameCount++;
}

/**
 * Tegner!
 */
function draw(renderInfo, camera) {
    clearCanvas(renderInfo.gl);
    // Tegn koordinatsystemet:
    drawCoord(renderInfo, camera);
    // Tegner planetene:
    drawSolarSystem(renderInfo, camera);
}


function drawCoord(renderInfo, camera) {
    // Aktiver shader:
    renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.coordBuffers.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.coordBuffers.color);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();
    camera.set();
    let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
    // Send kameramatrisene til shaderen:
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);
    // Tegn coord:
    renderInfo.gl.drawArrays(renderInfo.gl.LINES, 0, renderInfo.coordBuffers.vertexCount);
}

function drawSolarSystem(renderInfo, camera) {
    // Aktiver shader:
    renderInfo.gl.useProgram(renderInfo.baseShaderInfo.program);


    drawMoon(renderInfo, camera);
    drawEarth(renderInfo, camera)
}

function drawEarth(renderInfo, camera) {
    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.earthBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.earthBuffer.color);

    renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.earthBuffer.index);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();

    //Roter om egen y-akse:
    modelMatrix.rotate(renderInfo.planetsAnimation.earthRotationAngle, 1, 1, 0); 	//Roterer om origo. Y-aksen.
    //Skalerer likt i alle akser:
    modelMatrix.scale(1.5, 1.5, 1.5);
    // Send kameramatrisene til shaderen:
    camera.set();
    let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

    // Tegn jorda:
    // Aktiverer INDEKS-buffer før tegning vha. drawElements(...):
    renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.earthBuffer.index);

    // Tegner kula som wireframe:
    renderInfo.gl.drawElements(renderInfo.gl.LINE_STRIP, renderInfo.earthBuffer.indicesCount, renderInfo.gl.UNSIGNED_SHORT, 0);
}


function drawMoon(renderInfo, camera) {
    connectPositionAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.moonBuffer.position);
    connectColorAttribute(renderInfo.gl, renderInfo.baseShaderInfo, renderInfo.moonBuffer.color);

    renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.moonBuffer.index);

    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();

    //Baneberegning / Orbit:
    modelMatrix.rotate(renderInfo.planetsAnimation.moonOrbitAngle, 9, 2, -2);      //Går i "bane" om y-aksen.
    modelMatrix.translate(0, 0, renderInfo.planetsAnimation.moonTranslation);	   //Flytt langs z-aksen.
    //Roter først om egen y-akse:
    modelMatrix.rotate(renderInfo.planetsAnimation.moonRotationAngle, 10, 10, 20); 	//Roterer om origo. Y-aksen.
    //Skalerer likt i alle akser:
    modelMatrix.scale(0.5, 0.5, 0.5);
    // Send kameramatrisene til shaderen:
    camera.set();
    let modelviewMatrix = new Matrix4(camera.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
    renderInfo.gl.uniformMatrix4fv(renderInfo.baseShaderInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix.elements);

    // Tegn månen:
    // Aktiverer INDEKS-buffer før tegning vha. drawElements(...):
    renderInfo.gl.bindBuffer(renderInfo.gl.ELEMENT_ARRAY_BUFFER, renderInfo.moonBuffer.index);

    // Tegner kula som wireframe:
    renderInfo.gl.drawElements(renderInfo.gl.LINE_STRIP, renderInfo.moonBuffer.indicesCount, renderInfo.gl.UNSIGNED_SHORT, 0);
}


function initSphereBuffers(gl, color_in) {
    let positions = [];
    let indices = [];
    // let colors = color_in
    let colors = []

    // Basert på kode fra: http://learningwebgl.com/blog/?p=1253
    let radius = 5;
    let r = color_in[0], g = color_in[1], b = color_in[2], a = color_in[3];
    let latitudeBands = 20;     //latitude: parallellt med ekvator.
    let longitudeBands = 20;    //longitude: går fra nord- til sydpolen.

    //Genererer vertekser:
    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        let theta = latNumber * Math.PI / latitudeBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longitudeBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            positions.push(radius * x);
            positions.push(radius * y);
            positions.push(radius * z);

            colors.push(r)
            colors.push(g)
            colors.push(b)
            colors.push(a)

        }
    }

    //Genererer indeksdata for å knytte sammen verteksene:
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            let first = (latNumber * (longitudeBands + 1)) + longNumber;
            let second = first + longitudeBands + 1;
            indices.push(first);
            indices.push(second);
            indices.push(first + 1);

            indices.push(second);
            indices.push(second + 1);
            indices.push(first + 1);
        }
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    //Indeksbuffer: oppretter, binder og skriver data til bufret:
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        index: indexBuffer,
        vertexCount: positions.length / 3,
        indicesCount: indices.length
    };
}
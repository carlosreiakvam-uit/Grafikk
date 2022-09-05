import {WebGLCanvas} from '../../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../../base/helpers/WebGLShader.js';

/**
 * Et WebGL-program som tegner en enkel trekant.
 * Bruker ikke klasser, kun funksjoner.
 */
export function main() {
    // Oppretter et webGLCanvas for WebGL-tegning:
    const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
    const gl = webGLCanvas.gl;
    let baseShaderInfo = initBaseShaders(gl);
    let buffers = initBuffers(gl);
    draw(gl, baseShaderInfo, buffers);
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
 * Genererer view- og projeksjonsmatrisene.
 * Disse utgjør tilsanmmen det virtuelle kameraet.
 */
function initCamera(gl) {
    // Kameraposisjon:
    const camPosX = 9;
    const camPosY = 4;
    const camPosZ = 1;

    // Kamera ser mot ...
    const lookAtX = 0;
    const lookAtY = 1;
    const lookAtZ = 1;

    // Kameraorientering:
    const upX = 0;
    const upY = 1;
    const upZ = 0;

    let viewMatrix = new Matrix4();
    let projectionMatrix = new Matrix4();

    // VIEW-matrisa:
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);
    // PROJECTION-matrisa (frustum): cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    const fieldOfView = 75; // I grader.
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const near = 0.1;
    const far = 1000.0;
    // PROJEKSJONS-matrisa; Bruker cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    projectionMatrix.setPerspective(fieldOfView, aspect, near, far);

    return {
        viewMatrix: viewMatrix,
        projectionMatrix: projectionMatrix
    };
}


/**
 * Oppretter verteksbuffer for trekanten.
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initBuffers(gl) {
    let toPI = 2 * Math.PI;
    let positions = [];
    let colors = [];

    let stepGrader = 360 / 12;
    let step = (Math.PI / 180) * stepGrader;
    let r = 1, g = 0, b = 0, a = 1; // Fargeverdier.

// Startpunkt (toppen av kjegla):
    positions.push(0, 2, 0)
    colors.push(1, 0, 0, 1,)
    for (let phi = 0.0; phi <= toPI; phi += step) {
        positions.push(Math.cos(phi), 0, Math.sin(phi))
        g += 0.1; //Endrer litt på fargen for hver verteks.
        colors.push(r, g, b, a)
    }

    positions = new Float32Array(positions)
    colors = new Float32Array(colors)

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
    const type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexPosition, 3, type, false, 0, 0);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexPosition);
}

/**
 * Aktiverer color-bufferet.
 * Kalles fra draw()
 */
function connectColorAttribute(gl, baseShaderInfo, colorBuffer) {
    const type = gl.FLOAT;
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
        baseShaderInfo.attribLocations.vertexColor, 4, type, false, 0, 0);
    gl.enableVertexAttribArray(baseShaderInfo.attribLocations.vertexColor);
}

/**
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * Tegner!
 */
function draw(gl, baseShaderInfo, buffers) {
    clearCanvas(gl);

    // Aktiver shader:
    gl.useProgram(baseShaderInfo.program);

    // Kople posisjon og farge-attributtene til tilhørende buffer:
    connectPositionAttribute(gl, baseShaderInfo, buffers.position);
    connectColorAttribute(gl, baseShaderInfo, buffers.color);

    // Lag viewmodel-matrisa:
    let modelMatrix = new Matrix4();
    modelMatrix.setIdentity();

    let cameraMatrixes = initCamera(gl);
    let modelviewMatrix = new Matrix4(cameraMatrixes.viewMatrix.multiply(modelMatrix)); // NB! rekkefølge!

    // Send matrisene til shaderen:
    gl.uniformMatrix4fv(baseShaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(baseShaderInfo.uniformLocations.projectionMatrix, false, cameraMatrixes.projectionMatrix.elements);


    // Tegn!
    gl.drawArrays(gl.TRIANGLE_FAN, 0, buffers.vertexCount);
}

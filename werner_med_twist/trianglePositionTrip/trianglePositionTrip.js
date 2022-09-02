import {WebGLCanvas} from '../../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../../base/helpers/WebGLShader.js';

/**
 * Et WebGL-program som tegner en enkel trekant.
 * Bruker ikke klasser, kun funksjoner.
 */
export function main() {
    // Oppretter et canvas for WebGL-tegning:
    const canvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
    const gl = canvas.gl;
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
        },
        uniformLocations: {
            fragmentColor: gl.getUniformLocation(glslShader.shaderProgram, 'uFragmentColor'),
        },
    };
}

/**
 * Oppretter verteksbuffer for trekanten.
 * Et posisjonsbuffer og et fargebuffer.
 * MERK: Må være likt antall posisjoner og farger.
 */
function initBuffers(gl) {
    let elements = []
    elements[0] = -1
    elements[1] = 0
    elements[2] = 0
    elements[3] = -1.1
    elements[4] = 1
    elements[5] = 0
    elements[6] = -0.9
    elements[7] = 0
    elements[8] = 0
    for (let i = 9; i < 10; i++) {
        elements[i] = (i % 10 / 10).toFixed(1) - 0.5
    }
    console.log(elements)

    const positions = new Float32Array(
        elements
    );
    const positionBuffer = gl.createBuffer();
// Kopler til
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// Fyller
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
// Kopler fra
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
        position: positionBuffer,
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
 * Klargjør canvaset.
 * Kalles fra draw()
 */
function clearCanvas(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectColorUniform(gl, baseShaderInfo) {
    let colorRGBA = [1.0, 0.0, 0.5, 1.0];
    gl.uniform4f(baseShaderInfo.uniformLocations.fragmentColor, colorRGBA[0], colorRGBA[1], colorRGBA[2], colorRGBA[3]);
}

/**
 * Tegner!
 */
function draw(gl, baseShaderInfo, buffers) {
    clearCanvas(gl);

    // Aktiver shader:
    gl.useProgram(baseShaderInfo.program);

    // Kople posisjon-attributtet til tilhørende buffer:
    connectPositionAttribute(gl, baseShaderInfo, buffers.position);
    // Kople til farge uniform:
    connectColorUniform(gl, baseShaderInfo);
    // Tegn!
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.vertexCount);
}
